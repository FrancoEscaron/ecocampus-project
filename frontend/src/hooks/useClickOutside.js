import { useEffect, useRef } from "react";

export default function useClickOutside(ref, onCerrar, activo = true) {
  const cerrarRef = useRef(onCerrar);

  useEffect(() => {
    cerrarRef.current = onCerrar;
  }, [onCerrar]);

  useEffect(() => {
    if (!activo) return undefined;

    const alTocarFuera = (evento) => {
      if (ref.current && !ref.current.contains(evento.target)) {
        cerrarRef.current();
      }
    };

    const alPresionarTecla = (evento) => {
      if (evento.key === "Escape") {
        cerrarRef.current();
      }
    };

    document.addEventListener("pointerdown", alTocarFuera);
    document.addEventListener("keydown", alPresionarTecla);

    return () => {
      document.removeEventListener("pointerdown", alTocarFuera);
      document.removeEventListener("keydown", alPresionarTecla);
    };
  }, [activo, ref]);
}
