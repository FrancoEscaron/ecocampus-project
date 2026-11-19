import { useState } from "react";
import AdminCard from "./AdminCard";
import { getSubmissionStatusLabel } from "../../utils/actions";
import { isImageUrl, resolveEvidenceUrl } from "../../utils/format";

const MOTIVO_MINIMO = 10;
const MOTIVO_MAXIMO = 500;

export default function PendientesList({
  pendientes,
  onAprobar,
  onRechazar,
  onEliminar,
}) {
  const [rechazando, setRechazando] = useState(null);
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState("");

  const abrirRechazo = (id) => {
    setRechazando(id);
    setMotivo("");
    setError("");
  };

  const cerrarRechazo = () => {
    setRechazando(null);
    setMotivo("");
    setError("");
  };

  const confirmarRechazo = (id) => {
    const texto = motivo.trim();

    if (texto.length < MOTIVO_MINIMO) {
      setError(`Escribí al menos ${MOTIVO_MINIMO} caracteres para explicar el rechazo.`);
      return;
    }

    cerrarRechazo();
    onRechazar(id, texto);
  };

  return (
    <>
      {pendientes.map((pendiente) => {
        const nombre = pendiente.user
          ? `${pendiente.user.name} ${pendiente.user.lastName}`
          : "Desconocido";
        const evidenciaUrl = resolveEvidenceUrl(pendiente.evidenceUrl);
        const enRechazo = rechazando === pendiente._id;
        const acciones = enRechazo
          ? [
              {
                label: "Confirmar rechazo",
                className: "admin-btn-reject",
                onClick: () => confirmarRechazo(pendiente._id),
              },
              {
                label: "Cancelar",
                className: "admin-btn-neutral",
                onClick: cerrarRechazo,
              },
            ]
          : [
              {
                label: "Aprobar",
                className: "admin-btn-approve",
                onClick: () => onAprobar(pendiente._id),
              },
              {
                label: "Rechazar",
                className: "admin-btn-reject",
                onClick: () => abrirRechazo(pendiente._id),
              },
              {
                label: "Eliminar",
                className: "admin-btn-delete",
                onClick: () => onEliminar(pendiente._id),
              },
            ];

        return (
          <AdminCard
            key={pendiente._id}
            title={`Usuario: ${nombre}`}
            meta={`Acción: ${pendiente.actionType} · ${pendiente.quantity ?? 1} ${
              pendiente.unit || "acciones"
            } · ${pendiente.pointsValue} Eco-Points`}
            description={`Descripción: ${pendiente.description || "Sin descripción"}`}
            badge={{
              className: pendiente.status,
              text: getSubmissionStatusLabel(pendiente.status),
            }}
            acciones={acciones}
          >
            {enRechazo && (
              <div className="admin-reject-form">
                <label className="admin-reject-label" htmlFor={`motivo-rechazo-${pendiente._id}`}>
                  Motivo del rechazo
                </label>
                <textarea
                  id={`motivo-rechazo-${pendiente._id}`}
                  className="admin-reject-input"
                  value={motivo}
                  onChange={(evento) => {
                    setMotivo(evento.target.value);
                    if (error) setError("");
                  }}
                  maxLength={MOTIVO_MAXIMO}
                  rows={3}
                  aria-invalid={Boolean(error)}
                  aria-describedby={`motivo-ayuda-${pendiente._id}`}
                />
                <p id={`motivo-ayuda-${pendiente._id}`} className="admin-reject-hint">
                  Mínimo {MOTIVO_MINIMO} caracteres. El usuario verá este motivo en su panel.
                  {" "}
                  {motivo.trim().length}/{MOTIVO_MAXIMO}
                </p>
                {error && (
                  <p className="admin-reject-error" role="alert">
                    {error}
                  </p>
                )}
              </div>
            )}

            {evidenciaUrl &&
              (isImageUrl(evidenciaUrl) ? (
                <img
                  className="admin-evidence-img"
                  src={evidenciaUrl}
                  alt="Evidencia de la acción"
                />
              ) : (
                <a
                  className="admin-evidence-link"
                  href={evidenciaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver evidencia
                </a>
              ))}
          </AdminCard>
        );
      })}
    </>
  );
}
