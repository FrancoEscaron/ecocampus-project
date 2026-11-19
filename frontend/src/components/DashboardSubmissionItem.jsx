import { getSubmissionStatusLabel } from "../utils/actions";
import { formatShortDate, resolveEvidenceUrl } from "../utils/format";

export default function DashboardSubmissionItem({ envio }) {
  const cantidad = Number(envio.quantity);
  const cantidadTexto = cantidad > 0 ? `${cantidad} ${envio.unit || "acciones"} · ` : "";
  const evidenciaUrl = resolveEvidenceUrl(envio.evidenceUrl);

  return (
    <article className="submission-item dashboard-submission-item">
      <div className="submission-info">
        <h3>{envio.actionType || "Acción"}</h3>
        <p>{envio.description || "Sin descripción."}</p>
        <p>
          {cantidadTexto}Puntos: {Number(envio.pointsValue) || 0} ·{" "}
          {formatShortDate(envio.submittedAt)}
        </p>
        {envio.status === "rejected" && envio.reviewNote && (
          <p className="submission-review-note">Motivo del rechazo: {envio.reviewNote}</p>
        )}
      </div>

      <div className="dashboard-submission-side">
        <span className={`submission-status ${envio.status}`}>
          {getSubmissionStatusLabel(envio.status)}
        </span>
        {evidenciaUrl ? (
          <a
            className="submission-evidence-link"
            href={evidenciaUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver evidencia
          </a>
        ) : (
          <span className="submission-evidence-missing">Sin evidencia</span>
        )}
      </div>
    </article>
  );
}
