import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import useClickOutside from "../hooks/useClickOutside";

export default function UserMenu({ usuario, admin, onCerrarSesion, onNavegar }) {
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef(null);

  useClickOutside(contenedorRef, () => setAbierto(false), abierto);

  const elegir = () => {
    setAbierto(false);
    if (typeof onNavegar === "function") onNavegar();
  };

  return (
    <div
      className="user-menu"
      ref={contenedorRef}
      onClick={(evento) => evento.stopPropagation()}
    >
      <button
        className="user-menu-trigger"
        id="auth-link"
        type="button"
        aria-haspopup="true"
        aria-expanded={abierto}
        onClick={() => setAbierto((valor) => !valor)}
      >
        Hola, {usuario.name}
        <span
          className={abierto ? "user-menu-caret is-open" : "user-menu-caret"}
          aria-hidden="true"
        />
      </button>

      {abierto && (
        <div className="user-menu-panel">
          <p className="user-menu-account">
            <strong>
              {usuario.name} {usuario.lastName}
            </strong>
            <span>{usuario.email}</span>
          </p>
          <Link to="/panel" onClick={elegir}>
            Mi panel
          </Link>
          {admin && (
            <Link to="/admin" onClick={elegir}>
              Panel Admin
            </Link>
          )}
          <button
            className="user-menu-logout"
            type="button"
            onClick={() => {
              elegir();
              onCerrarSesion();
            }}
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
