import { useRef, useState } from "react";
import { enviarEvidencia } from "../api";
import useFocusTrap from "../hooks/useFocusTrap";
import useForm from "../hooks/useForm";
import {
  calculateEstimatedPoints,
  formatUnitRate,
  getQuantityMin,
  getQuantityStep,
  isWholeUnit,
} from "../utils/actions";
import { getApiErrorMessage } from "../utils/apiError";

export default function EvidenceModal({ accion, onCerrar, onEnviado }) {
  const { valores, cambiar } = useForm({ description: "", quantity: "1" });
  const archivoRef = useRef(null);
  const overlayRef = useRef(null);
  const [aviso, setAviso] = useState({ texto: "", tipo: "" });
  const [enviando, setEnviando] = useState(false);

  useFocusTrap(overlayRef, onCerrar);

  if (!accion) return null;

  const unit = accion.unit || "acción";
  const pointsPerUnit = Number(accion.pointsPerUnit) || 0;
  const wholeUnit = isWholeUnit(unit);
  const quantityStep = getQuantityStep(unit);
  const quantityMin = getQuantityMin(unit);
  const puntosEstimados = calculateEstimatedPoints(pointsPerUnit, valores.quantity);

  const enviar = async (evento) => {
    evento.preventDefault();

    const description = valores.description.trim();
    const quantity = Number(valores.quantity);
    const file = archivoRef.current?.files?.[0];
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

    if (description.length < 10 || description.length > 1000) {
      setAviso({
        texto: "La descripción debe tener entre 10 y 1000 caracteres.",
        tipo: "error",
      });
      return;
    }

    if (!Number.isFinite(quantity) || quantity <= 0 || quantity > 100000) {
      setAviso({
        texto: "La cantidad debe ser mayor a 0 y menor o igual a 100000.",
        tipo: "error",
      });
      return;
    }

    if (wholeUnit && !Number.isInteger(quantity)) {
      setAviso({ texto: `La cantidad de ${unit} debe ser un número entero.`, tipo: "error" });
      return;
    }

    if (!file) {
      setAviso({ texto: "Seleccioná una foto o un PDF como evidencia.", tipo: "error" });
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      setAviso({
        texto: "Formato no permitido. Subí una imagen JPG, PNG o WebP o un PDF.",
        tipo: "error",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAviso({ texto: "El archivo supera el límite de 5 MB.", tipo: "error" });
      return;
    }

    const formData = new FormData();
    formData.append("actionKey", accion.key);
    formData.append("description", description);
    formData.append("quantity", quantity);
    formData.append("evidence", file);

    setEnviando(true);
    setAviso({ texto: "", tipo: "" });

    try {
      const { respuesta, datos } = await enviarEvidencia(formData);

      if (respuesta.status === 401) {
        setAviso({
          texto: "Tu sesión venció. Iniciá sesión nuevamente.",
          tipo: "error",
        });
        return;
      }

      if (datos?.success) {
        setAviso({
          texto: datos.message || "Evidencia enviada. Queda pendiente de revisión.",
          tipo: "success",
        });
        if (onEnviado) await onEnviado();
        window.setTimeout(onCerrar, 1500);
      } else {
        setAviso({
          texto: getApiErrorMessage(datos, "No se pudo enviar la evidencia."),
          tipo: "error",
        });
        if (respuesta.status === 409 && onEnviado) await onEnviado();
      }
    } catch {
      setAviso({
        texto: "No se pudo enviar la evidencia. Intentá nuevamente.",
        tipo: "error",
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div
      className="course-modal-overlay"
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="evidence-modal-title"
      onClick={(evento) => {
        if (evento.target === evento.currentTarget) onCerrar();
      }}
    >
      <div className="course-modal-box">
        <button
          className="course-modal-close-btn"
          type="button"
          aria-label="Cerrar"
          onClick={onCerrar}
        >
          ×
        </button>
        <h2 className="course-modal-title" id="evidence-modal-title">
          Subir evidencia
        </h2>
        <p className="course-modal-text">
          {accion.title} · {pointsPerUnit} Eco-Points por {formatUnitRate(unit)}
        </p>
        <form className="form" id="evidence-form" onSubmit={enviar}>
          <div className="form-group">
            <label htmlFor="evidence-description">Contanos qué hiciste</label>
            <textarea
              id="evidence-description"
              name="description"
              rows="4"
              minLength="10"
              maxLength="1000"
              required
              placeholder="Describí brevemente la acción realizada."
              value={valores.description}
              onChange={cambiar}
            ></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="evidence-quantity">Cantidad ({unit})</label>
            <input
              type="number"
              id="evidence-quantity"
              name="quantity"
              min={quantityMin}
              step={quantityStep}
              required
              value={valores.quantity}
              onChange={cambiar}
            />
          </div>
          <p className="evidence-points-preview" id="evidence-points-preview" aria-live="polite">
            Puntos estimados: {puntosEstimados} Eco-Points
          </p>
          <div className="form-group">
            <label htmlFor="evidence-file">Foto o PDF de la evidencia</label>
            <input
              type="file"
              id="evidence-file"
              ref={archivoRef}
              accept="image/jpeg,image/png,image/webp,application/pdf"
              required
            />
          </div>
          <div id="evidence-feedback">
            {aviso.texto && <div className={`action-msg ${aviso.tipo}`}>{aviso.texto}</div>}
          </div>
          <div className="action-modal-actions">
            <button type="submit" className="submit-btn" disabled={enviando}>
              {enviando ? "Enviando..." : "Enviar evidencia"}
            </button>
            <button type="button" className="action-modal-cancel" onClick={onCerrar}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
