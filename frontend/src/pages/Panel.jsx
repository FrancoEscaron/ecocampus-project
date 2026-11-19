import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { obtenerPanel } from "../api";
import CourseModal from "../components/CourseModal";
import DashboardCourseCard from "../components/DashboardCourseCard";
import DashboardSubmissionItem from "../components/DashboardSubmissionItem";
import PointsHistory from "../components/PointsHistory";
import PurchaseItem from "../components/PurchaseItem";
import StatCard from "../components/StatCard";
import useCarga from "../hooks/useCarga";
import useSeo from "../hooks/useSeo";
import { downloadCsv } from "../utils/csv";
import { formatShortDate } from "../utils/format";
import { clearSession, updateUser } from "../utils/session";

export default function Panel() {
  const navigate = useNavigate();

  useSeo({
    titulo: "Mi panel | EcoCampus",
    descripcion: "Tu actividad, tus Eco-Points y tus cursos en un solo lugar.",
    ruta: "/panel",
    noindex: true,
  });

  const [cursoAbierto, setCursoAbierto] = useState(null);
  const { datos, error, recargar } = useCarga(
    obtenerPanel,
    "No se pudo cargar tu panel. Intentá nuevamente más tarde.",
  );

  useEffect(() => {
    if (!datos) return;

    updateUser({
      ecoPoints: datos.user.ecoPoints,
      coursesOwned: (datos.courses || []).map((curso) => curso._id),
    });
  }, [datos]);

  const cerrarSesion = () => {
    clearSession();
    navigate("/", { state: { toast: "Cerraste sesión." } });
  };

  const cursos = datos?.courses || [];
  const envios = datos?.submissions || [];
  const compras = datos?.purchases || [];
  const movimientos = datos?.pointsHistory || [];
  const resumenPuntos = {
    earned: datos?.stats.pointsEarned ?? 0,
    spent: datos?.stats.pointsSpent ?? 0,
    balance: datos?.user.ecoPoints ?? 0,
  };
  const usuarioModal = datos
    ? { ...datos.user, coursesOwned: cursos.map((curso) => curso._id) }
    : null;

  const exportarPuntos = () => {
    const filas = [["Fecha", "Tipo", "Concepto", "Puntos"]];

    movimientos.forEach((movimiento) => {
      filas.push([
        formatShortDate(movimiento.date),
        movimiento.type === "earned" ? "Puntos ganados" : "Puntos canjeados",
        movimiento.description,
        movimiento.type === "earned" ? movimiento.points : -movimiento.points,
      ]);
    });

    downloadCsv(`eco-points-${new Date().toISOString().slice(0, 10)}.csv`, filas);
  };

  return (
    <section className="dashboard-section" id="dashboard">
      <div className="dashboard-head">
        <h1 className="dashboard-title">Mi panel</h1>
        <p className="dashboard-subtitle">
          Tu actividad, tus Eco-Points y tus cursos en un solo lugar.
        </p>
      </div>

      <div
        id="dashboard-feedback"
        className={error ? "dashboard-msg error" : "dashboard-msg"}
        role="status"
        aria-live="polite"
        hidden={!error}
      >
        {error}
      </div>

      {datos && (
        <div id="dashboard-content">
          <div className="dashboard-profile">
            <div className="dashboard-profile-info">
              <h2 id="dashboard-user-name">
                {datos.user.name} {datos.user.lastName}
              </h2>
              <p id="dashboard-user-email">{datos.user.email}</p>
              <p id="dashboard-user-since" className="dashboard-profile-since">
                {datos.user.memberSince
                  ? `Miembro desde ${formatShortDate(datos.user.memberSince)}`
                  : ""}
              </p>
            </div>
            <button
              type="button"
              id="dashboard-logout"
              className="dashboard-logout-btn"
              onClick={cerrarSesion}
            >
              Cerrar sesión
            </button>
          </div>

          <div className="dashboard-stats" id="dashboard-stats">
            <StatCard
              label="Eco-Points"
              value={datos.user.ecoPoints}
              hint="Saldo disponible"
            />
            <StatCard
              label="Acciones pendientes"
              value={datos.stats.pending}
              hint="En revisión"
            />
            <StatCard
              label="Acciones aprobadas"
              value={datos.stats.approved}
              hint={`${datos.stats.pointsEarned} puntos ganados`}
            />
            <StatCard
              label="Cursos desbloqueados"
              value={datos.stats.coursesOwned}
              hint="Disponibles en tu panel"
            />
          </div>

          <div className="dashboard-panels">
            <section className="dashboard-panel">
              <div className="dashboard-panel-head">
                <h2>Mis cursos</h2>
                <Link to="/cursos" className="dashboard-panel-link">
                  Ver catálogo
                </Link>
              </div>
              <div id="dashboard-courses" className="dashboard-course-list">
                {cursos.length === 0 ? (
                  <div className="dashboard-empty">
                    <p>Todavía no desbloqueaste ningún curso.</p>
                    <Link to="/cursos" className="dashboard-empty-link">
                      Ver cursos
                    </Link>
                  </div>
                ) : (
                  cursos.map((curso) => (
                    <DashboardCourseCard
                      key={curso._id}
                      curso={curso}
                      onAbrir={() => setCursoAbierto(curso)}
                    />
                  ))
                )}
              </div>
            </section>

            <section className="dashboard-panel">
              <div className="dashboard-panel-head">
                <h2>Mis acciones</h2>
                <Link to="/validar" className="dashboard-panel-link">
                  Validar acción
                </Link>
              </div>
              <div id="dashboard-submissions" className="dashboard-list">
                {envios.length === 0 ? (
                  <div className="dashboard-empty">
                    <p>Todavía no enviaste acciones.</p>
                    <Link to="/validar" className="dashboard-empty-link">
                      Validar acción
                    </Link>
                  </div>
                ) : (
                  envios.map((envio) => (
                    <DashboardSubmissionItem key={envio._id} envio={envio} />
                  ))
                )}
              </div>
            </section>

            <section className="dashboard-panel">
              <div className="dashboard-panel-head">
                <h2>Historial de Eco-Points</h2>
                <button
                  type="button"
                  className="dashboard-export-btn"
                  onClick={exportarPuntos}
                  disabled={movimientos.length === 0}
                >
                  Exportar CSV
                </button>
              </div>
              <PointsHistory movimientos={movimientos} resumen={resumenPuntos} />
            </section>

            <section className="dashboard-panel">
              <div className="dashboard-panel-head">
                <h2>Historial de compras</h2>
              </div>
              <div id="dashboard-purchases" className="dashboard-list">
                {compras.length === 0 ? (
                  <div className="dashboard-empty">
                    <p>Todavía no realizaste compras.</p>
                    <Link to="/cursos" className="dashboard-empty-link">
                      Ver cursos
                    </Link>
                  </div>
                ) : (
                  compras.map((compra) => (
                    <PurchaseItem key={compra._id} compra={compra} />
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      )}

      {cursoAbierto && (
        <CourseModal
          curso={cursoAbierto}
          usuario={usuarioModal}
          onCerrar={() => setCursoAbierto(null)}
          onActualizar={recargar}
        />
      )}
    </section>
  );
}
