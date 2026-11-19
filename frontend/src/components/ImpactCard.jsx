import { useEffect, useRef, useState } from "react";
import { formatNumber } from "../utils/format";

const DURACION = 900;
const ESPERA_MAXIMA = 1200;

export default function ImpactCard({ metrica }) {
  const objetivo = Number(metrica.value) || 0;
  const decimales = Number.isInteger(objetivo) ? 0 : 1;
  const [valor, setValor] = useState(0);
  const contadorRef = useRef(null);

  useEffect(() => {
    let frame = null;
    let observador = null;
    let temporizador = null;
    let finalizado = false;

    const terminar = () => {
      if (finalizado) return;
      finalizado = true;
      setValor(objetivo);
    };

    const animar = () => {
      setValor(0);

      if (objetivo === 0) {
        terminar();
        return;
      }

      const inicio = performance.now();

      const paso = (ahora) => {
        if (finalizado) return;
        const progreso = Math.min((ahora - inicio) / DURACION, 1);
        const suavizado = 1 - Math.pow(1 - progreso, 3);
        setValor(objetivo * suavizado);

        if (progreso < 1) {
          frame = requestAnimationFrame(paso);
        } else {
          terminar();
        }
      };

      frame = requestAnimationFrame(paso);
    };

    const contador = contadorRef.current;

    if (!("IntersectionObserver" in window) || !contador) {
      frame = requestAnimationFrame(animar);
    } else {
      observador = new IntersectionObserver(
        (entradas, actual) => {
          entradas.forEach((entrada) => {
            if (!entrada.isIntersecting) return;
            animar();
            actual.unobserve(entrada.target);
          });
        },
        { threshold: 0.3 },
      );

      observador.observe(contador);
    }

    temporizador = window.setTimeout(terminar, ESPERA_MAXIMA);

    return () => {
      finalizado = true;
      if (frame) cancelAnimationFrame(frame);
      if (observador) observador.disconnect();
      if (temporizador) window.clearTimeout(temporizador);
    };
  }, [objetivo]);

  return (
    <article className="impact-card">
      <div className="impact-icon">{metrica.icon || "🌱"}</div>
      <div className="impact-number-wrapper">
        <span className="counter" data-target={objetivo} ref={contadorRef}>
          {formatNumber(valor, decimales)}
        </span>
        {metrica.unit && <span className="unit">{metrica.unit}</span>}
      </div>
      <p>{metrica.label}</p>
    </article>
  );
}
