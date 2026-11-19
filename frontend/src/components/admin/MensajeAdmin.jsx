import { useEffect } from "react";

export default function MensajeAdmin({ mensaje, onOcultar }) {
  useEffect(() => {
    if (!mensaje?.texto || mensaje.fijo || !onOcultar) return undefined;

    const temporizador = window.setTimeout(() => onOcultar(), 4000);
    return () => window.clearTimeout(temporizador);
  }, [mensaje, onOcultar]);

  if (!mensaje?.texto) return null;

  return <div className={`admin-msg ${mensaje.tipo || "success"}`}>{mensaje.texto}</div>;
}
