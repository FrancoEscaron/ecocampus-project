import { useRef } from "react";
import useFocusTrap from "../hooks/useFocusTrap";
import {
  getCourseCostLabel,
  getCourseLevelLabel,
  getCoursePaymentLabel,
  getCoursePaymentType,
  getModulesLabel,
} from "../utils/courses";
import CourseContent from "./CourseContent";

export default function CourseModal({ curso, usuario, onCerrar, onActualizar }) {
  const overlayRef = useRef(null);

  useFocusTrap(overlayRef, onCerrar);

  if (!curso || !usuario) return null;

  const meta = [
    curso.duration ? `Duración: ${curso.duration}` : "",
    Number.isFinite(Number(curso.modulesCount)) ? getModulesLabel(curso.modulesCount) : "",
  ]
    .filter(Boolean)
    .join(" · ");
  const levelLabel = getCourseLevelLabel(curso.level);
  const paymentType = getCoursePaymentType(curso);
  const paymentLabel = getCoursePaymentLabel(paymentType);

  return (
    <div
      className="course-modal-overlay"
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="course-modal-title"
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
        <h2 className="course-modal-title" id="course-modal-title">
          {curso.title}
        </h2>
        <div className="course-modal-badges">
          <span className="course-badge course-badge-level">{levelLabel}</span>
          <span className={`course-badge course-badge-payment ${paymentType}`}>
            {paymentLabel}
          </span>
        </div>
        <p className="course-modal-text">{curso.description}</p>
        {meta && <p className="course-modal-meta">{meta}</p>}
        <p className="course-modal-cost">Costo: {getCourseCostLabel(curso)}</p>
        <div className="modal-body-container">
          <CourseContent
            curso={curso}
            usuario={usuario}
            onActualizar={onActualizar}
          />
        </div>
      </div>
    </div>
  );
}
