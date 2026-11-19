import { useRef } from "react";
import useFocusTrap from "../hooks/useFocusTrap";

export default function ConfirmDialog({
  titulo,
  mensaje,
  textoConfirmar = "Eliminar",
  textoCancelar = "Cancelar",
  onConfirmar,
  onCerrar,
}) {
  const overlayRef = useRef(null);

  useFocusTrap(overlayRef, onCerrar);

  return (
    <div
      className="confirm-overlay"
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
      onClick={(evento) => {
        if (evento.target === evento.currentTarget) onCerrar();
      }}
    >
      <div className="confirm-box">
        <h2 className="confirm-title" id="confirm-dialog-title">
          {titulo}
        </h2>
        <p className="confirm-message" id="confirm-dialog-message">
          {mensaje}
        </p>
        <div className="confirm-actions">
          <button type="button" className="admin-btn-neutral" onClick={onCerrar}>
            {textoCancelar}
          </button>
          <button type="button" className="admin-btn-delete" onClick={onConfirmar}>
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
