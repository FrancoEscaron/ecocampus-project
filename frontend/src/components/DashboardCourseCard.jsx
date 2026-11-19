import { Link } from "react-router-dom";
import { DEFAULT_COURSE_IMAGE, resolveAssetUrl } from "../utils/format";
import { getModulesLabel } from "../utils/courses";

export default function DashboardCourseCard({ curso, onAbrir }) {
  const total = Number(curso.progress?.total) || 0;
  const completados = Number(curso.progress?.completed) || 0;
  const completo = total > 0 && completados === total;

  return (
    <article className="dashboard-course-card">
      <img
        className="dashboard-course-image"
        src={resolveAssetUrl(curso.image)}
        alt={curso.title || "Curso de EcoCampus"}
        loading="lazy"
        onError={(event) => {
          event.currentTarget.src = DEFAULT_COURSE_IMAGE;
        }}
      />
      <div className="dashboard-course-info">
        <h3>{curso.title}</h3>
        <p className="dashboard-course-meta">
          {curso.duration || "Duración no disponible"} · {getModulesLabel(curso.modulesCount)}
        </p>
        <p className="dashboard-course-cost">{Number(curso.pointsCost) || 0} Eco-Points</p>
        <div className="dashboard-course-actions">
          <button type="button" className="dashboard-course-btn" onClick={onAbrir}>
            Ver curso
          </button>
          {completo && (
            <Link
              to={`/panel/certificado/${curso._id}`}
              className="dashboard-course-certificate"
            >
              Certificado
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
