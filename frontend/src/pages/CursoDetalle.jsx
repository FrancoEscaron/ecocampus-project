import { useCallback, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { obtenerCurso } from "../api";
import CourseContent from "../components/CourseContent";
import useCarga from "../hooks/useCarga";
import useSeo from "../hooks/useSeo";
import {
  getCourseCostLabel,
  getCourseLevelLabel,
  getCoursePaymentLabel,
  getCoursePaymentType,
  getModulesLabel,
  getOwnedCourseIds,
} from "../utils/courses";
import { DEFAULT_COURSE_IMAGE, resolveAssetUrl } from "../utils/format";
import { toAbsoluteUrl } from "../utils/seo";
import { getUser } from "../utils/session";

const MAX_DESCRIPCION_SEO = 160;

const recortarTexto = (texto = "", maximo = MAX_DESCRIPCION_SEO) => {
  const limpio = String(texto).trim();
  if (limpio.length <= maximo) return limpio;
  return `${limpio.slice(0, maximo - 1).trimEnd()}…`;
};

export default function CursoDetalle() {
  const { id } = useParams();
  const [usuario, setUsuario] = useState(getUser);

  const cargarCurso = useCallback(() => obtenerCurso(id), [id]);
  const { datos, cargando, error } = useCarga(
    cargarCurso,
    "No encontramos este curso. Puede que ya no esté disponible o haya sido archivado.",
  );
  const curso = datos && typeof datos === "object" ? datos : null;

  const tieneAcceso =
    Boolean(curso) &&
    (usuario?.role === "admin" ||
      getOwnedCourseIds(usuario).includes(String(curso?._id)));

  const jsonLd = useMemo(() => {
    if (!curso) return null;

    const price = Math.max(0, Number(curso.price) || 0);

    return {
      "@context": "https://schema.org",
      "@type": "Course",
      name: curso.title,
      description: curso.description,
      provider: { "@type": "Organization", name: "EcoCampus" },
      url: toAbsoluteUrl(`/cursos/${curso._id}`),
      image: toAbsoluteUrl(resolveAssetUrl(curso.image)),
      offers: {
        "@type": "Offer",
        price: price.toFixed(2),
        priceCurrency: curso.currency || "UYU",
        category: price > 0 ? "Paid" : "Free",
      },
    };
  }, [curso]);

  useSeo({
    titulo: curso ? `${curso.title} | EcoCampus` : "Curso | EcoCampus",
    descripcion: curso
      ? recortarTexto(curso.description)
      : "Ficha del curso de EcoCampus.",
    ruta: curso ? `/cursos/${curso._id}` : `/cursos/${id}`,
    imagen: curso ? resolveAssetUrl(curso.image) : "",
    jsonLd,
    noindex: !cargando && !curso,
  });

  const rutaIngreso = {
    pathname: "/ingresar",
    state: { from: `/cursos/${id}` },
  };

  let contenido = null;

  if (cargando) {
    contenido = <p className="public-empty">Cargando curso...</p>;
  } else if (error || !curso) {
    contenido = (
      <div className="public-empty">
        <p>{error || "No encontramos este curso."}</p>
        <Link className="public-empty-link" to="/cursos">
          Ver todos los cursos
        </Link>
      </div>
    );
  } else {
    const tipoPago = getCoursePaymentType(curso);

    contenido = (
      <>
        <article className="course-detail">
        <div className="course-detail-media">
          <img
            src={resolveAssetUrl(curso.image)}
            alt={curso.title || "Curso de EcoCampus"}
            onError={(evento) => {
              evento.currentTarget.src = DEFAULT_COURSE_IMAGE;
            }}
          />
          <span className="course-tag">{getModulesLabel(curso.modulesCount)}</span>
        </div>

        <div className="course-detail-body">
          <div className="course-badges">
            <span className="course-badge course-badge-level">
              {getCourseLevelLabel(curso.level)}
            </span>
            <span className={`course-badge course-badge-payment ${tipoPago}`}>
              {getCoursePaymentLabel(tipoPago)}
            </span>
          </div>

          <h1 className="course-detail-title">{curso.title}</h1>
          <p className="course-detail-description">{curso.description}</p>
          {curso.duration && (
            <p className="course-duration">Duración: {curso.duration}</p>
          )}
          <p className="course-detail-cost">Costo: {getCourseCostLabel(curso)}</p>

          {!tieneAcceso &&
            Array.isArray(curso.modules) &&
            curso.modules.length > 0 && (
              <div className="course-detail-modules">
                <h2 className="course-detail-modules-title">Módulos del curso</h2>
                <ol className="course-detail-module-list">
                  {curso.modules.map((modulo) => (
                    <li className="course-detail-module-item" key={modulo._id}>
                      {modulo.title}
                    </li>
                  ))}
                </ol>
              </div>
            )}

          <div className="course-detail-actions">
            {!usuario && (
              <Link className="submit-btn" to={rutaIngreso}>
                Iniciar sesión para desbloquear el curso
              </Link>
            )}
          </div>

          {!usuario && (
            <p className="course-detail-note">
              Iniciá sesión para desbloquear el curso y acceder al contenido exclusivo.
            </p>
          )}
          {usuario && !tieneAcceso && (
            <p className="course-detail-note">
              El contenido exclusivo se habilita al desbloquear el curso.
            </p>
          )}
          {tieneAcceso && (
            <p className="course-detail-note">Ya tenés acceso a este curso.</p>
          )}
        </div>
      </article>

      {usuario && (
        <section className="course-content-section" id="contenido-curso">
          <h2 className="course-content-title">
            {tieneAcceso ? "Contenido del curso" : "Desbloquear curso"}
          </h2>
          <CourseContent
            curso={curso}
            usuario={usuario}
            onActualizar={() => setUsuario(getUser())}
          />
        </section>
      )}
    </>
  );
  }

  return (    <>
      <section className="section course-detail-section" id="curso-detalle">
        <Link className="course-detail-back" to="/cursos">
          ← Volver a cursos
        </Link>
        {contenido}
      </section>
    </>
  );
}
