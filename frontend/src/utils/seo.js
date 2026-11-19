const getSeoBase = () => {
  const configurada = import.meta.env.VITE_SITE_URL;
  if (configurada) return configurada.replace(/\/$/, "");
  if (typeof window === "undefined") return "";
  return window.location.origin;
};

export const toAbsoluteUrl = (ruta, base = getSeoBase()) => {
  if (!ruta) return "";
  if (/^https?:\/\//i.test(ruta)) return ruta;
  return `${base}${ruta.startsWith("/") ? ruta : `/${ruta}`}`;
};
