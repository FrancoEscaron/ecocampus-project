import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registrarUsuario } from "../api";
import useForm from "../hooks/useForm";

export default function Registro() {
  const { valores, cambiar } = useForm({
    name: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [aviso, setAviso] = useState({ texto: "", tipo: "" });
  const [enviando, setEnviando] = useState(false);
  const navigate = useNavigate();

  const registrar = async (evento) => {
    evento.preventDefault();
    setEnviando(true);

    try {
      const { datos } = await registrarUsuario({
        name: valores.name.trim(),
        lastName: valores.lastName.trim(),
        email: valores.email.trim(),
        password: valores.password.trim(),
      });

      if (datos?.success) {
        setAviso({
          tipo: "success",
          texto: "¡Registro exitoso! Ahora podés iniciar sesión.",
        });
        window.setTimeout(() => navigate("/ingresar"), 900);
      } else {
        setAviso({
          tipo: "error",
          texto: datos?.message || "No se pudo completar el registro.",
        });
      }
    } catch {
      setAviso({
        tipo: "error",
        texto: "No se pudo completar el registro. Intentá nuevamente.",
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="login-page-wrapper" id="main-content" tabIndex={-1}>
      <div className="form-container">
        <h1 className="contact-title">Crear Cuenta</h1>
        <p className="contact-subtitle">
          Regístrate para comenzar a aprender y pagar con acciones sustentables.
        </p>

        <form id="register-form" className="form" onSubmit={registrar}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Nombre</label>
              <input
                type="text"
                name="name"
                id="name"
                required
                autoComplete="given-name"
                placeholder="Tu nombre"
                value={valores.name}
                onChange={cambiar}
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Apellido</label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                required
                autoComplete="family-name"
                placeholder="Tu apellido"
                value={valores.lastName}
                onChange={cambiar}
              />
            </div>
          </div>

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
              autoComplete="new-password"
              minLength="8"
              maxLength="128"
              placeholder="******"
              value={valores.password}
              onChange={cambiar}
            />
          </div>

          <p
            className={aviso.tipo ? `form-feedback ${aviso.tipo}` : "form-feedback"}
            id="register-feedback"
            role="status"
            aria-live="polite"
            hidden={!aviso.texto}
          >
            {aviso.texto}
          </p>
          <button type="submit" className="submit-btn modal-action-btn" disabled={enviando}>
            {enviando ? "Registrando..." : "Registrarse"}
          </button>
        </form>
      </div>
    </main>
  );
}
