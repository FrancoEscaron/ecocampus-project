import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { obtenerCursos } from "../api";
import ContactSection from "../components/ContactSection";
import CourseCard from "../components/CourseCard";
import useCarga from "../hooks/useCarga";
import useSeo from "../hooks/useSeo";
import { getOwnedCourseIds, matchesCourseFilters } from "../utils/courses";
import { esAdmin, getUser } from "../utils/session";

const PESTANAS = [
  { valor: "all", texto: "Todos los cursos" },
  { valor: "owned", texto: "Mis cursos" },
];

export default function Cursos() {
  const [pestana, setPestana] = useState("all");
  const [busqueda, setBusqueda] = useState("");
  const [nivel, setNivel] = useState("all");
  const [modalidad, setModalidad] = useState("all");
  const [usuario] = useState(getUser);

  const { datos, cargando, error } = useCarga(
    obtenerCursos,
    "No se pudieron cargar los cursos. Intentá nuevamente más tarde.",
  );
  const cursos = useMemo(() => (Array.isArray(datos) ? datos : []), [datos]);
  const cursosPropios = getOwnedCourseIds(usuario);
  const esUsuarioAdmin = esAdmin();

  useSeo({
    titulo: "Nuestros cursos | EcoCampus",
    descripcion:
      "Aquí encontrarás todos nuestros cursos disponibles para que empieces tu ruta de aprendizaje.",
    ruta: "/cursos",
  });

  const limpiarFiltros = () => {
    setBusqueda("");
    setNivel("all");
    setModalidad("all");
  };

  let contenido = null;
  let infoResultados = "";

  if (error) {
    contenido = <p className="public-empty">{error}</p>;
  } else if (!cargando) {
    if (pestana === "owned" && !usuario) {
      contenido = (
        <p className="public-empty">
          Iniciá sesión para ver tus cursos.
          <Link className="public-empty-link" to="/ingresar">
            Iniciar sesión
          </Link>
        </p>
      );
    } else if (pestana === "owned" && esUsuarioAdmin) {
      contenido = (
        <p className="public-empty">
          Como administrador podés acceder a todos los cursos desde “Todos los cursos”.
        </p>
      );
    } else {
      const cursosBase =
        pestana === "owned"
          ? cursos.filter((curso) => cursosPropios.includes(String(curso._id)))
          : cursos;

      if (cursosBase.length === 0) {
        contenido = (
          <p className="public-empty">
            {pestana === "owned"
              ? "Todavía no compraste ningún curso."
              : "Todavía no hay cursos disponibles."}
          </p>
        );
      } else {
        const visibles = cursosBase.filter((curso) =>
          matchesCourseFilters(curso, {
            searchTerm: busqueda,
            level: nivel,
            payment: modalidad,
          }),
        );
        const consulta = busqueda.trim();
        const sufijo = consulta ? ` para “${consulta}”` : "";

        infoResultados =
          visibles.length === cursosBase.length
            ? `${visibles.length} ${
                visibles.length === 1 ? "curso disponible" : "cursos disponibles"
              }${sufijo}`
            : `${visibles.length} de ${cursosBase.length} cursos${sufijo}`;

        contenido =
          visibles.length === 0 ? (
            <div className="public-empty">
              <p>No encontramos cursos con esos filtros.</p>
              <button type="button" className="course-clear-btn" onClick={limpiarFiltros}>
                Limpiar filtros
              </button>
            </div>
          ) : (
            visibles.map((curso) => (
              <CourseCard
                key={curso._id}
                curso={curso}
                comprado={cursosPropios.includes(String(curso._id))}
              />
            ))
          );
      }
    }
  }

  return (
    <>
      <section className="section-courses" id="courses">
        <div className="section-head">
          <h1 className="section-title">Nuestros cursos</h1>
          <p className="section-description">
            Aquí encontrarás todos nuestros cursos disponibles para que empieces tu ruta de
            aprendizaje
          </p>
        </div>

        <div className="course-tabs" role="tablist" aria-label="Filtrar cursos">
          {PESTANAS.map(({ valor, texto }) => (
            <button
              key={valor}
              className={pestana === valor ? "course-tab-btn is-active" : "course-tab-btn"}
              type="button"
              role="tab"
              aria-selected={pestana === valor}
              aria-controls="courses-grid"
              onClick={() => setPestana(valor)}
            >
              {texto}
            </button>
          ))}
        </div>

        <div className="course-controls">
          <div className="course-search">
            <input
              type="search"
              id="course-search-input"
              placeholder="Buscar por título o descripción..."
              aria-label="Buscar cursos"
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
            />
          </div>
          <div className="course-filter-group">
            <label htmlFor="course-level-filter">Nivel</label>
            <select
              id="course-level-filter"
              value={nivel}
              onChange={(evento) => setNivel(evento.target.value)}
            >
              <option value="all">Todos los niveles</option>
              <option value="principiante">Principiante</option>
              <option value="intermedio">Intermedio</option>
              <option value="avanzado">Avanzado</option>
              <option value="todos">Apto para todos</option>
            </select>
          </div>
          <div className="course-filter-group">
            <label htmlFor="course-payment-filter">Modalidad</label>
            <select
              id="course-payment-filter"
              value={modalidad}
              onChange={(evento) => setModalidad(evento.target.value)}
            >
              <option value="all">Todas</option>
              <option value="points">100% Eco-Points</option>
              <option value="mixed">Pago mixto</option>
              <option value="money">Pago con dinero</option>
              <option value="free">Gratuito</option>
            </select>
          </div>
          <button
            type="button"
            id="course-clear-filters"
            className="course-clear-btn"
            onClick={limpiarFiltros}
          >
            Limpiar filtros
          </button>
        </div>

        <p className="course-results-info" id="course-results-info" aria-live="polite">
          {infoResultados}
        </p>

        <div className="cards-grid" id="courses-grid">
          {contenido}
        </div>
      </section>

      <ContactSection />
    </>
  );
}
