import { useEffect, useState } from "react";

export default function useAhora(intervalo = 60000) {
  const [ahora, setAhora] = useState(() => Date.now());

  useEffect(() => {
    const temporizador = window.setInterval(() => setAhora(Date.now()), intervalo);
    return () => window.clearInterval(temporizador);
  }, [intervalo]);

  return ahora;
}
