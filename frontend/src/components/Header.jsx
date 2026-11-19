import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { clearSession, esAdmin, getUser } from "../utils/session";
import UserMenu from "./UserMenu";

export default function Header() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const navigate = useNavigate();
  const usuario = getUser();

  const cerrarSesion = () => {
    clearSession();
    navigate("/", { state: { toast: "Cerraste sesión." } });
  };

  const alternarMenu = () => {
    setMenuAbierto((abierto) => !abierto);
  };

  return (
    <header className="main-header" id="inicio">
      <div className="inner-header">
        <Link
          className="brand"
          to="/"
          aria-label="EcoCampus"
          onClick={() => setMenuAbierto(false)}
        >
          <img
            className="brand-logo"
            aria-hidden="true"
            src="/assets/icons/EcoCampus.png"
            alt="logo de ecocampus"
          />
          <span className="brand-name">
            <strong>Eco</strong>Campus
          </span>
        </Link>
        <button
          className="nav-icon"
          id="navIcon"
          type="button"
          aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
          aria-controls="mainNav"
          aria-expanded={menuAbierto}
          onClick={alternarMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav
          className={menuAbierto ? "main-nav is-open" : "main-nav"}
          id="mainNav"
          onClick={() => setMenuAbierto(false)}
        >
          <ul>
            <li>
              <Link to="/">Inicio</Link>
            </li>
            <li>
              <Link to="/validar">Validar acciones</Link>
            </li>
            <li>
              <Link to="/cursos">Cursos</Link>
            </li>
            <li>
              <Link to="/impacto">Nuestro impacto</Link>
            </li>
            <li>
              <Link to="/faq">Preguntas frecuentes</Link>
            </li>
            <li>
              <a href="#contacto">Contacto</a>
            </li>
            <li className="nav-user-item">
              {usuario ? (
                <UserMenu
                  usuario={usuario}
                  admin={esAdmin()}
                  onCerrarSesion={cerrarSesion}
                  onNavegar={() => setMenuAbierto(false)}
                />
              ) : (
                <Link to="/ingresar" id="auth-link">
                  Ingresar
                </Link>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
