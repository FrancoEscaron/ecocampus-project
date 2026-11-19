import { getSubmissionStatusLabel } from "../utils/actions";
import { formatDate, resolveEvidenceUrl } from "../utils/format";

export default function SubmissionItem({ envio }) {
  const cantidad = Number(envio.quantity);
  const cantidadTexto = cantidad > 0 ? `${cantidad} ${envio.unit || "acciones"} · ` : "";
  const evidenciaUrl = resolveEvidenceUrl(envio.evidenceUrl);

  return (
    <article className="submission-item">
      <div className="submission-info">
        <h3>{envio.actionType}</h3>
        <p>
          {cantidadTexto}
          {envio.pointsValue} Eco-Points · {formatDate(envio.submittedAt)}
        </p>
        <span className={`submission-status ${envio.status}`}>
          {getSubmissionStatusLabel(envio.status)}
        </span>
      </div>

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
        <span className="submission-evidence-missing">Evidencia no disponible</span>
      )}
    </article>
  );
}
