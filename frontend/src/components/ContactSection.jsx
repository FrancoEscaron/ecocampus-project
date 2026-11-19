import { useState } from "react";
import { enviarContacto } from "../api";
import useForm from "../hooks/useForm";
import { getApiErrorMessage } from "../utils/apiError";

export default function ContactSection() {
  const { valores, cambiar, reiniciar } = useForm({
    nombre: "",
    apellido: "",
    correo: "",
    mensaje: "",
  });
  const [aviso, setAviso] = useState({ texto: "", tipo: "" });
  const [enviando, setEnviando] = useState(false);

  const enviar = async (evento) => {
    evento.preventDefault();
    setEnviando(true);

    try {
      const { datos } = await enviarContacto({
        nombre: valores.nombre.trim(),
        apellido: valores.apellido.trim(),
        correo: valores.correo.trim(),
        mensaje: valores.mensaje.trim(),
      });

      if (datos?.success) {
        reiniciar();
        setAviso({
          tipo: "success",
          texto: datos.message || "Mensaje enviado. Te responderemos pronto.",
        });
      } else {
        setAviso({
          tipo: "error",
          texto: getApiErrorMessage(datos, "No se pudo enviar el mensaje."),
        });
      }
    } catch {
      setAviso({
        tipo: "error",
        texto: "No se pudo enviar el mensaje. Intentá nuevamente.",
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section className="contact-section" id="contacto">
      <div className="form-container">
        <h2 className="contact-title">Ponte en contacto</h2>
        <p className="contact-subtitle">¿Tienes alguna duda o propuesta? Escríbenos.</p>

        <form action="/contacto" className="form" id="full-form" onSubmit={enviar}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nombre">Nombre:</label>
              <input
                type="text"
                name="nombre"
                id="nombre"
                placeholder="Tu nombre"
                autoComplete="given-name"
                minLength="2"
                maxLength="80"
                value={valores.nombre}
                onChange={cambiar}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="apellido">Apellido:</label>
              <input
                type="text"
                name="apellido"
                id="apellido"
                placeholder="Tu apellido"
                autoComplete="family-name"
                minLength="2"
                maxLength="80"
                value={valores.apellido}
                onChange={cambiar}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="correo">Correo electrónico</label>
            <input
              type="email"
              name="correo"
              id="correo"
              placeholder="ejemplo@correo.com"
              autoComplete="email"
              maxLength="120"
              value={valores.correo}
              onChange={cambiar}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="mensaje">Mensaje:</label>
            <textarea
              name="mensaje"
              id="mensaje"
              rows="4"
              placeholder="Escribe tu mensaje"
              minLength="10"
              maxLength="2000"
              value={valores.mensaje}
              onChange={cambiar}
              required
            ></textarea>
          </div>

          <p
            className={aviso.tipo ? `form-feedback ${aviso.tipo}` : "form-feedback"}
            id="contact-feedback"
            role="status"
            aria-live="polite"
            hidden={!aviso.texto}
          >
            {aviso.texto}
          </p>
          <button type="submit" className="submit-btn" disabled={enviando}>
            {enviando ? "Enviando..." : "Enviar mensaje"}
          </button>
        </form>
      </div>
    </section>
  );
}
