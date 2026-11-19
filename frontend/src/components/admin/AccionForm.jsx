import { useEffect, useRef, useState } from "react";
import { actualizarAccion, crearAccion } from "../../api";
import useForm from "../../hooks/useForm";
import { getActionUnit } from "../../utils/actions";
import { getApiErrorMessage } from "../../utils/apiError";
import MensajeAdmin from "./MensajeAdmin";

export default function AccionForm({ abierto, accion, onCerrar, onGuardado }) {
  const { valores, cambiar } = useForm({
    title: accion?.title || "",
    points: accion?.pointsPerUnit ?? 10,
    impact: accion?.impactMetric || "residuos",
    order: accion?.order ?? 0,
    cooldownDays: accion?.cooldownDays ?? 30,
    imageAlt: accion?.imageAlt || "",
    description: accion?.description || "",
  });
  const archivoRef = useRef(null);
  const contenedorRef = useRef(null);
  const [aviso, setAviso] = useState(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!abierto) return;
    contenedorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [abierto]);

  const enviar = async (evento) => {
    evento.preventDefault();
    const formData = new FormData();
    const archivo = archivoRef.current?.files?.[0];

    formData.append("title", valores.title.trim());
    formData.append("description", valores.description.trim());
    formData.append("pointsPerUnit", Number(valores.points));
    formData.append("impactMetric", valores.impact);
    formData.append("order", Number(valores.order));
    formData.append("cooldownDays", Number(valores.cooldownDays));
    formData.append("imageAlt", valores.imageAlt.trim());

    if (archivo) formData.append("image", archivo);

    setEnviando(true);
    setAviso(null);

    try {
      const { datos } = accion
        ? await actualizarAccion(accion._id, formData)
        : await crearAccion(formData);

      if (datos?.success) {
        onGuardado(
          datos.message ||
            (accion ? "Acción actualizada con éxito." : "Acción creada con éxito."),
        );
      } else {
        setAviso({ tipo: "error", texto: getApiErrorMessage(datos) });
      }
    } catch {
      setAviso({ tipo: "error", texto: "No se pudo guardar la acción." });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div
      id="action-form-container"
      ref={contenedorRef}
      className={abierto ? "admin-section admin-form-box is-open" : "admin-section admin-form-box"}
    >
      <h2 className="admin-title" id="action-form-title">
        {accion ? "Editar acción" : "Nueva acción"}
      </h2>
      <p id="action-key-note" className="admin-hint">
        {accion
          ? `Clave: ${accion.key}`
          : "La clave se genera automáticamente a partir del título."}
      </p>
      <div id="action-form-feedback" aria-live="polite">
        <MensajeAdmin mensaje={aviso} />
      </div>
      <form id="create-action-form" onSubmit={enviar}>
        <input type="hidden" id="action-id" value={accion?._id || ""} readOnly />
        <div className="admin-form-grid">
          <div className="admin-form-group">
            <label htmlFor="action-title">Título de la acción</label>
            <input
              type="text"
              id="action-title"
              name="title"
              required
              placeholder="Ej: Limpiar parques"
              value={valores.title}
              onChange={cambiar}
            />
          </div>
          <div className="admin-form-group">
            <label htmlFor="action-points">Eco-Points por unidad</label>
            <input
              type="number"
              id="action-points"
              name="points"
              min="0"
              step="1"
              required
              value={valores.points}
              onChange={cambiar}
            />
          </div>
        </div>
        <div className="admin-form-grid">
          <div className="admin-form-group">
            <label htmlFor="action-impact">Impacto y unidad</label>
            <select
              id="action-impact"
              name="impact"
              required
              value={valores.impact}
              onChange={cambiar}
            >
              <option value="residuos">Residuos (kg)</option>
              <option value="arboles">Árboles plantados (árboles)</option>
              <option value="horas">Horas de voluntariado (horas)</option>
              <option value="energia">Energía ahorrada (kWh)</option>
              <option value="electronicos">Electrónicos reutilizados (unidades)</option>
              <option value="acciones">Acciones generales (acciones)</option>
            </select>
            <span id="action-impact-hint" className="admin-hint">
              Unidad: {getActionUnit(valores.impact)}
            </span>
          </div>
          <div className="admin-form-group">
            <label htmlFor="action-order">Orden</label>
            <input
              type="number"
              id="action-order"
              name="order"
              min="0"
              step="1"
              required
              value={valores.order}
              onChange={cambiar}
            />
          </div>
        </div>
        <div className="admin-form-group">
          <label htmlFor="action-cooldown">Espera para repetir (días)</label>
          <input
            type="number"
            id="action-cooldown"
            name="cooldownDays"
            min="0"
            max="365"
            step="1"
            required
            value={valores.cooldownDays}
            onChange={cambiar}
          />
          <span className="admin-hint">
            Se cuenta desde la aprobación de la evidencia anterior. 0 significa que se puede
            repetir apenas se apruebe.
          </span>
        </div>
        <div className="admin-form-group">
          <label htmlFor="action-image-alt">Texto alternativo de la imagen</label>
          <input
            type="text"
            id="action-image-alt"
            name="imageAlt"
            maxLength="200"
            placeholder="Descripción de la imagen"
            value={valores.imageAlt}
            onChange={cambiar}
          />
        </div>
        <div className="admin-form-group">
          <label htmlFor="action-description">Descripción</label>
          <textarea
            id="action-description"
            name="description"
            rows="3"
            required
            placeholder="Descripción de la acción"
            value={valores.description}
            onChange={cambiar}
          ></textarea>
        </div>
        <div className="admin-form-group">
          <label htmlFor="action-image">Imagen de la acción (obligatoria al crear)</label>
          <input
            type="file"
            id="action-image"
            name="image"
            ref={archivoRef}
            accept="image/jpeg,image/png,image/webp"
            required={!accion}
          />
        </div>
        <div className="admin-form-actions">
          <button
            type="submit"
            className="admin-btn-create"
            id="action-submit-btn"
            disabled={enviando}
          >
            {accion ? "Actualizar acción" : "Guardar acción"}
          </button>
          <button type="button" id="cancel-action-btn" className="admin-btn-cancel" onClick={onCerrar}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
