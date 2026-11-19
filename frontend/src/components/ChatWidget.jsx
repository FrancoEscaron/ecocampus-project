import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { calentarChat, enviarMensajeChat } from "../api";
import ChatIcon from "./ChatIcon";
import "./ChatWidget.css";

const MAX_CARACTERES = 500;

const MENSAJE_INICIAL = {
  id: "bienvenida",
  autor: "bot",
  texto:
    "¡Hola! Soy EcoBot, el asistente de EcoCampus. Te puedo ayudar con cursos, Eco-Points, certificados y acciones sustentables.",
};

const SUGERENCIAS = [
  "¿Qué cursos puedo hacer?",
  "¿Cómo gano Eco-Points?",
  "¿Cómo obtengo mi certificado?",
];

const armarHistorial = (mensajes) =>
  mensajes
    .filter((mensaje) => mensaje.id !== MENSAJE_INICIAL.id && !mensaje.error)
    .map((mensaje) => ({
      rol: mensaje.autor === "usuario" ? "usuario" : "bot",
      texto: mensaje.texto,
    }));

export default function ChatWidget() {
  const location = useLocation();
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState([MENSAJE_INICIAL]);
  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(false);
  const botonRef = useRef(null);
  const inputRef = useRef(null);
  const listaRef = useRef(null);

  useEffect(() => {
    calentarChat();
  }, []);

  useEffect(() => {
    if (!abierto) return;
    inputRef.current?.focus();
  }, [abierto]);

  useEffect(() => {
    if (listaRef.current) {
      listaRef.current.scrollTop = listaRef.current.scrollHeight;
    }
  }, [mensajes, cargando]);

  if (location.pathname.startsWith("/panel/certificado")) return null;

  const cerrar = () => {
    setAbierto(false);
    botonRef.current?.focus();
  };

  const nuevaConversacion = () => {
    setMensajes([MENSAJE_INICIAL]);
    setTexto("");
    setCargando(false);
    inputRef.current?.focus();
  };

  const enviar = async (contenido) => {
    const limpio = contenido.trim();
    if (!limpio || cargando) return;

    const mensajeUsuario = {
      id: crypto.randomUUID(),
      autor: "usuario",
      texto: limpio,
    };

    setMensajes((previos) => [...previos, mensajeUsuario]);
    setTexto("");
    setCargando(true);

    try {
      const datos = await enviarMensajeChat(limpio, armarHistorial(mensajes));
      setMensajes((previos) => [
        ...previos,
        { id: crypto.randomUUID(), autor: "bot", texto: datos.respuesta },
      ]);
    } catch (error) {
      const aviso =
        error?.message && error.message !== "Failed to fetch"
          ? error.message
          : "Uy, tuve un problema. ¿Lo intentás de nuevo?";
      setMensajes((previos) => [
        ...previos,
        { id: crypto.randomUUID(), autor: "bot", texto: aviso, error: true },
      ]);
    } finally {
      setCargando(false);
    }
  };

  const manejarEnvio = (evento) => {
    evento.preventDefault();
    enviar(texto);
  };

  return (
    <div className="chat-widget">
      <button
        ref={botonRef}
        type="button"
        className="chat-boton"
        onClick={() => (abierto ? cerrar() : setAbierto(true))}
        aria-label={abierto ? "Cerrar el chat de EcoBot" : "Abrir el chat de EcoBot"}
        aria-expanded={abierto}
        aria-controls="chat-panel"
      >
        {abierto ? "×" : <ChatIcon />}
      </button>

      {abierto && (
        <section
          className="chat-ventana"
          id="chat-panel"
          role="dialog"
          aria-label="Asistente virtual de EcoCampus"
          onKeyDown={(evento) => {
            if (evento.key === "Escape") cerrar();
          }}
        >
          <header className="chat-encabezado">
            <div>
              <p className="chat-titulo">EcoBot</p>
              <p className="chat-subtitulo">Asistente virtual</p>
            </div>
            <div className="chat-acciones">
              <button
                type="button"
                className="chat-nueva"
                onClick={nuevaConversacion}
                title="Empezar una conversación nueva"
              >
                Nueva
              </button>
              <button
                type="button"
                className="chat-cerrar"
                onClick={cerrar}
                aria-label="Cerrar el chat"
              >
                ×
              </button>
            </div>
          </header>

          <ul className="chat-mensajes" ref={listaRef} aria-live="polite">
            {mensajes.map((mensaje) => (
              <li
                key={mensaje.id}
                className={`chat-msg ${mensaje.autor}${mensaje.error ? " error" : ""}`}
              >
                {mensaje.texto}
              </li>
            ))}
            {cargando && <li className="chat-msg bot chat-escribiendo">Escribiendo…</li>}
          </ul>

          {mensajes.length === 1 && !cargando && (
            <div className="chat-sugerencias">
              {SUGERENCIAS.map((sugerencia) => (
                <button
                  key={sugerencia}
                  type="button"
                  className="chat-sugerencia"
                  onClick={() => enviar(sugerencia)}
                >
                  {sugerencia}
                </button>
              ))}
            </div>
          )}

          <form className="chat-form" onSubmit={manejarEnvio}>
            <label className="chat-etiqueta" htmlFor="chat-mensaje">
              Tu mensaje
            </label>
            <div className="chat-fila">
              <input
                ref={inputRef}
                id="chat-mensaje"
                className="chat-input"
                type="text"
                value={texto}
                onChange={(evento) => setTexto(evento.target.value)}
                placeholder="Escribí tu pregunta…"
                maxLength={MAX_CARACTERES}
                autoComplete="off"
              />
              <button
                type="submit"
                className="chat-enviar"
                disabled={cargando || !texto.trim()}
              >
                Enviar
              </button>
            </div>
            <p className="chat-contador">
              {texto.length}/{MAX_CARACTERES}
            </p>
          </form>
        </section>
      )}
    </div>
  );
}
