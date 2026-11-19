import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

const getFocusable = (container) =>
  Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter((element) => {
    if (element.hasAttribute("hidden") || element.getAttribute("aria-hidden") === "true") {
      return false;
    }
    if (element.disabled) return false;
    return element.getClientRects().length > 0;
  });

export default function useFocusTrap(containerRef, onCerrar, activo = true) {
  const cerrarRef = useRef(onCerrar);

  useEffect(() => {
    cerrarRef.current = onCerrar;
  }, [onCerrar]);

  useEffect(() => {
    if (!activo) return undefined;

    const container = containerRef.current;
    if (!container) return undefined;

    const anterior = document.activeElement;
    const enfocables = getFocusable(container);
    const inicial = enfocables[0] || container;

    if (typeof inicial.focus === "function") inicial.focus();

    const alPresionar = (evento) => {
      if (evento.key === "Escape") {
        evento.preventDefault();
        if (typeof cerrarRef.current === "function") cerrarRef.current();
        return;
      }

      if (evento.key !== "Tab") return;

      const actuales = getFocusable(container);

      if (actuales.length === 0) {
        evento.preventDefault();
        container.focus();
        return;
      }

      const primero = actuales[0];
      const ultimo = actuales[actuales.length - 1];
      const actual = document.activeElement;

      if (evento.shiftKey) {
        if (actual === primero || !container.contains(actual)) {
          evento.preventDefault();
          ultimo.focus();
        }
        return;
      }

      if (actual === ultimo || !container.contains(actual)) {
        evento.preventDefault();
        primero.focus();
      }
    };

    document.addEventListener("keydown", alPresionar);

    return () => {
      document.removeEventListener("keydown", alPresionar);
      if (anterior && typeof anterior.focus === "function") anterior.focus();
    };
  }, [activo, containerRef]);
}
