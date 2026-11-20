import { useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ContactSection from "../components/ContactSection";
import Toast from "../components/Toast";
import useSeo from "../hooks/useSeo";

export default function Inicio() {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = location.state?.toast || "";
  const cerrarToast = useCallback(
    () => navigate(location.pathname, { replace: true, state: null }),
    [location.pathname, navigate],
  );

  useSeo({
    titulo: "EcoCampus — Aprende mientras cambias al mundo",
    descripcion:
      "Tus acciones valen al igual que tu dinero, por eso, puedes acceder a cursos pagando con acciones sustentables.",
    ruta: "/",
  });

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Aprende mientras cambias al mundo</h1>
          <p className="hero-subtitle">
            Tus acciones valen al igual que tu dinero, por eso, puedes acceder a cursos
            pagando con acciones sustentables.
          </p>
          <h2 className="hero-description-main">Una realidad</h2>
          <p className="hero-description">
            En Uruguay se generan más de 4 millones de toneladas de residuos al año en total
            (abarcando residuos sólidos urbanos, industriales, agropecuarios y especiales) y
            solo menos del 5% se recicla. El restante 95% finaliza su ciclo en vertederos,
            rellenos sanitarios o basurales a cielo abierto. Al mismo tiempo, solo 2 de cada 10
            jóvenes en contextos vulnerables logran terminar el liceo.
          </p>
          <p className="hero-description">
            <strong>
              EcoCampus une estas dos realidades: convertimos el reciclaje en recursos reales
              para apoyar la educación de quien más lo necesita.
            </strong>
          </p>

          <div className="hero-actions">
            <Link to="/cursos" className="button button-primary">
              Ver cursos
            </Link>
            <Link to="/validar" className="button button-secondary">
              Validar acciones
            </Link>
          </div>
        </div>
      </section>

      <section className="section-how">
        <div className="how-head">
          <h2 className="title-how">¿Cómo funciona nuestro sistema de pago?</h2>
          <article className="how-card">
            <h3>Elige tu curso</h3>
            <p>Encuentra tu pasión en nuestro catálogo</p>
          </article>
          <article className="how-card">
            <h3>Define tu método de pago</h3>
            <p>Selecciona qué porcentaje pagarás con dinero y qué porcentaje con acciones</p>
          </article>
          <article className="how-card">
            <h3>Confirma el pago</h3>
            <p>Valida tu compra en nuestro sistema</p>
          </article>
          <article className="how-card">
            <h3>¡Desbloquea tu aprendizaje!</h3>
            <p>Accede a tu curso y comienza a aprender mientras contribuyes al cambio</p>
          </article>
        </div>
      </section>

      <ContactSection />
      <Toast mensaje={toast} onCerrar={cerrarToast} />
    </>
  );
}
