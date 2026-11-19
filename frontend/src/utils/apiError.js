export const getApiErrorMessage = (datos, fallback = "Ocurrió un error.") => {
  const detalle = Array.isArray(datos?.errors) ? ` ${datos.errors.join(" ")}` : "";
  return `${datos?.message || fallback}${detalle}`;
};
