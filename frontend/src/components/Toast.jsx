import { useEffect } from "react";

export default function Toast({ mensaje, tipo = "success", onCerrar }) {
  useEffect(() => {
    if (!mensaje) return undefined;

    const temporizador = window.setTimeout(() => {
      if (typeof onCerrar === "function") onCerrar();
    }, 4000);

    return () => window.clearTimeout(temporizador);
  }, [mensaje, onCerrar]);

  if (!mensaje) return null;

  return (
    <div
      className={`toast ${tipo}`}
      role={tipo === "error" ? "alert" : "status"}
      aria-live={tipo === "error" ? "assertive" : "polite"}
    >
      {mensaje}
    </div>
  );
}
