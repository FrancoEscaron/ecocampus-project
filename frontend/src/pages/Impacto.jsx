import { obtenerImpacto } from "../api";
import ContactSection from "../components/ContactSection";
import ImpactCard from "../components/ImpactCard";
import useCarga from "../hooks/useCarga";
import useSeo from "../hooks/useSeo";

export default function Impacto() {
  const { datos, cargando, error } = useCarga(
    obtenerImpacto,
    "No se pudo cargar el impacto. Intentá nuevamente más tarde.",
  );

  useSeo({
    titulo: "Nuestro impacto | EcoCampus",
    descripcion: "Estos números reflejan las evidencias aprobadas por la comunidad.",
    ruta: "/impacto",
  });

  const metricas = Array.isArray(datos?.metrics) ? datos.metrics : [];
  const totales = datos?.totals || {};

  return (
    <>
      <section className="main-impact">
        <h1>Nuestro impacto</h1>
        <p className="impact-intro">
          Estos números reflejan las evidencias aprobadas por la comunidad.
        </p>
        <div className="impact-grid" id="impact-grid">
          {error ? (
            <p className="impact-empty">{error}</p>
          ) : (
            !cargando && (
              <>
                {metricas.map((metrica) => (
                  <ImpactCard key={`${metrica.key}-${metrica.value}`} metrica={metrica} />
                ))}
                <ImpactCard
                  key={`acciones-aprobadas-${totales.approvedActions || 0}`}
                  metrica={{
                    key: "acciones-aprobadas",
                    icon: "✅",
                    label: "Acciones aprobadas",
                    unit: "",
                    value: totales.approvedActions || 0,
                  }}
                />
                <ImpactCard
                  key={`eco-points-${totales.pointsAwarded || 0}`}
                  metrica={{
                    key: "eco-points",
                    icon: "🌱",
                    label: "Eco-Points otorgados",
                    unit: "",
                    value: totales.pointsAwarded || 0,
                  }}
                />
              </>
            )
          )}
        </div>
        {!error && (
          <p
            className="impact-empty"
            id="impact-empty"
            hidden={Number(totales.approvedActions) > 0}
          >
            Todavía no hay acciones aprobadas. Cuando se validen, el impacto aparecerá acá.
          </p>
        )}
      </section>

      <ContactSection />
    </>
  );
}
