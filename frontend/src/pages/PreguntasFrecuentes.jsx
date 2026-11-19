import { obtenerFaqs } from "../api";
import ContactSection from "../components/ContactSection";
import FaqItem from "../components/FaqItem";
import useCarga from "../hooks/useCarga";
import useSeo from "../hooks/useSeo";

export default function PreguntasFrecuentes() {
  const { datos, cargando, error } = useCarga(
    obtenerFaqs,
    "No se pudieron cargar las preguntas frecuentes. Intentá nuevamente más tarde.",
  );

  useSeo({
    titulo: "Preguntas frecuentes | EcoCampus",
    descripcion:
      "Respuestas a las dudas más comunes sobre EcoCampus, los cursos y los Eco-Points.",
    ruta: "/faq",
  });
  const faqs = Array.isArray(datos) ? datos : [];

  let contenido = null;

  if (error) {
    contenido = <p className="public-empty">{error}</p>;
  } else if (!cargando) {
    contenido =
      faqs.length === 0 ? (
        <p className="public-empty">Todavía no hay preguntas frecuentes cargadas.</p>
      ) : (
        faqs.map((faq) => <FaqItem key={faq._id} faq={faq} />)
      );
  }

  return (
    <>
      <section className="faq-section">
        <h1>Preguntas frecuentes</h1>
        <div className="faq-container" id="faq-container">
          {contenido}
        </div>
      </section>

      <ContactSection />
    </>
  );
}
