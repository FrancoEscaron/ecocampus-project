import { useEffect, useRef, useState } from "react";
import { actualizarFaq, crearFaq } from "../../api";
import useForm from "../../hooks/useForm";
import { getApiErrorMessage } from "../../utils/apiError";
import MensajeAdmin from "./MensajeAdmin";

export default function FaqForm({ abierto, faq, onCerrar, onGuardado }) {
  const { valores, cambiar } = useForm({
    question: faq?.question || "",
    answer: faq?.answer || "",
  });
  const [aviso, setAviso] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const contenedorRef = useRef(null);

  useEffect(() => {
    if (!abierto) return;
    contenedorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [abierto]);

  const enviar = async (evento) => {
    evento.preventDefault();
    const datosFaq = {
      question: valores.question.trim(),
      answer: valores.answer.trim(),
    };

    setEnviando(true);
    setAviso(null);

    try {
      const { datos } = faq
        ? await actualizarFaq(faq._id, datosFaq)
        : await crearFaq(datosFaq);

      if (datos?.success) {
        onGuardado(
          datos.message || (faq ? "Pregunta actualizada." : "Pregunta creada."),
        );
      } else {
        setAviso({ tipo: "error", texto: getApiErrorMessage(datos) });
      }
    } catch {
      setAviso({ tipo: "error", texto: "No se pudo guardar la pregunta." });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div
      id="faq-form-container"
      ref={contenedorRef}
      className={abierto ? "admin-section admin-form-box is-open" : "admin-section admin-form-box"}
    >
      <h2 className="admin-title" id="faq-form-title">
        {faq ? "Editar pregunta frecuente" : "Nueva pregunta frecuente"}
      </h2>
      <div id="faq-feedback" aria-live="polite">
        <MensajeAdmin mensaje={aviso} />
      </div>
      <form id="create-faq-form" onSubmit={enviar}>
        <input type="hidden" id="faq-id" value={faq?._id || ""} readOnly />
        <div className="admin-form-group">
          <label htmlFor="faq-question">Pregunta</label>
          <input
            type="text"
            id="faq-question"
            name="question"
            required
            placeholder="Ej: ¿Cómo gano Eco-Points?"
            value={valores.question}
            onChange={cambiar}
          />
        </div>
        <div className="admin-form-group">
          <label htmlFor="faq-answer">Respuesta</label>
          <textarea
            id="faq-answer"
            name="answer"
            rows="3"
            required
            placeholder="Explicación detallada..."
            value={valores.answer}
            onChange={cambiar}
          ></textarea>
        </div>
        <div className="admin-form-actions">
          <button type="submit" className="admin-btn-create" id="faq-submit-btn" disabled={enviando}>
            {faq ? "Actualizar pregunta" : "Guardar pregunta"}
          </button>
          <button type="button" id="cancel-faq-btn" className="admin-btn-cancel" onClick={onCerrar}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
