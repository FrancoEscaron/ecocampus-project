import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { iniciarSesion } from "../api";
import useForm from "../hooks/useForm";
import useSeo from "../hooks/useSeo";
import { getApiErrorMessage } from "../utils/apiError";
import { setSession } from "../utils/session";

export default function Ingresar() {
  const { valores, cambiar } = useForm({ email: "", password: "" });
  const [aviso, setAviso] = useState({ texto: "", tipo: "" });
  const [enviando, setEnviando] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useSeo({
    titulo: "Iniciar sesión | EcoCampus",
    descripcion: "Ingresá a tu cuenta de EcoCampus para validar acciones y desbloquear cursos.",
    ruta: "/ingresar",
    noindex: true,
  });

  const ingresar = async (evento) => {
    evento.preventDefault();
    setEnviando(true);

    try {
      const { datos } = await iniciarSesion({
        email: valores.email.trim(),
        password: valores.password.trim(),
      });
      const sesion = datos?.data || {};

      if (datos?.success && sesion.token) {
        setSession({ token: sesion.token, user: sesion.user });
        setAviso({
          tipo: "success",
          texto: `¡Bienvenido ${sesion.user.name}!`,
        });
        window.setTimeout(() => {
          const destino = location.state?.from || "/";
          const destinoState = { ...location.state };
          delete destinoState.from;
          navigate(destino, {
            replace: true,
            state: Object.keys(destinoState).length ? destinoState : undefined,
          });
        }, 800);
      } else {
        setAviso({
          tipo: "error",
          texto: getApiErrorMessage(datos, "No se pudo iniciar sesión."),
        });
      }
    } catch {
      setAviso({
        tipo: "error",
        texto: "No se pudo iniciar sesión. Intentá nuevamente.",
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="login-hero-wrapper" id="main-content" tabIndex={-1}>
      <div className="form-container login-form-box">
        <h1 className="contact-title login-title-center">Iniciar Sesión</h1>
        <form id="login-form" className="form login-form-spacing" onSubmit={ingresar}>
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              name="email"
              id="email"
              required
              autoComplete="email"
              placeholder="correo@ejemplo.com"
              value={valores.email}
              onChange={cambiar}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              name="password"
              id="password"
              required
              autoComplete="current-password"
              placeholder="******"
              value={valores.password}
              onChange={cambiar}
            />
          </div>
          <p
            className={aviso.tipo ? `form-feedback ${aviso.tipo}` : "form-feedback"}
            id="login-feedback"
            role="status"
            aria-live="polite"
            hidden={!aviso.texto}
          >
            {aviso.texto}
          </p>
          <button type="submit" className="submit-btn modal-full-width-btn" disabled={enviando}>
            {enviando ? "Ingresando..." : "Ingresar"}
          </button>
          <Link to="/registro" className="register">
            ¿No tienes cuenta?
          </Link>
        </form>
      </div>
    </main>
  );
}
