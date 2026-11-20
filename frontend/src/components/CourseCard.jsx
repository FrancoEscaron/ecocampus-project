import { Link } from "react-router-dom";
import {
  getCourseCostLabel,
  getCourseLevelLabel,
  getCoursePaymentLabel,
  getCoursePaymentType,
  getModulesLabel,
} from "../utils/courses";
import { DEFAULT_COURSE_IMAGE, resolveAssetUrl } from "../utils/format";

export default function CourseCard({ curso, comprado = false }) {
  const tipoPago = getCoursePaymentType(curso);

  return (
    <Link
      className={comprado ? "course-card is-owned" : "course-card"}
      data-course-id={curso._id}
      to={`/cursos/${curso._id}`}
    >
      <div className="course-media">
        <img
          src={resolveAssetUrl(curso.image)}
          alt={curso.title || "Curso de EcoCampus"}
          loading="lazy"
          onError={(evento) => {
            evento.currentTarget.src = DEFAULT_COURSE_IMAGE;
          }}
        />
        <span className="course-tag">{getModulesLabel(curso.modulesCount)}</span>
        {comprado && <span className="course-owned-badge">Comprado</span>}
      </div>

      <div className="course-body">
        <div className="course-badges">
          <span className="course-badge course-badge-level">
            {getCourseLevelLabel(curso.level)}
          </span>
          <span className={`course-badge course-badge-payment ${tipoPago}`}>
            {getCoursePaymentLabel(tipoPago)}
          </span>
        </div>
        <h2 className="course-name">
          <span className="course-name-btn">{curso.title}</span>
        </h2>
        <p className="course-duration">Duración: {curso.duration}</p>
        <p className="course-card-cost">Costo: {getCourseCostLabel(curso)}</p>
        <p className="course-description">{curso.description}</p>
      </div>
    </Link>
  );
}
