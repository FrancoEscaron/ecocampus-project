import { clearSession, getToken } from "./utils/session";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const construirUrl = (ruta) => {
  if (/^https?:\/\//i.test(ruta)) return ruta;
  return `${API_URL}${ruta.startsWith("/") ? ruta : `/${ruta}`}`;
};

const redirigirAIngresar = () => {
  if (typeof window === "undefined") return;
  if (window.location.pathname === "/ingresar") return;
  window.location.assign("/ingresar");
};

export const pedir = async (ruta, { method = "GET", body, headers = {}, auth = true } = {}) => {
  const cabeceras = { ...headers };
  const token = getToken();
  const esFormData = body instanceof FormData;

  if (auth && token) cabeceras.Authorization = `Bearer ${token}`;
  if (body && !esFormData && !cabeceras["Content-Type"]) {
    cabeceras["Content-Type"] = "application/json";
  }

  const respuesta = await fetch(construirUrl(ruta), {
    method,
    headers: cabeceras,
    body: body === undefined || body === null ? undefined : esFormData ? body : JSON.stringify(body),
  });

  if (respuesta.status === 401 && auth) {
    clearSession();
    redirigirAIngresar();
  }

  let datos = null;

  try {
    datos = await respuesta.json();
  } catch {
    datos = null;
  }

  return { respuesta, datos };
};

export const iniciarSesion = (credenciales) =>
  pedir("/api/auth/login", { method: "POST", body: credenciales, auth: false });

export const registrarUsuario = (datos) =>
  pedir("/api/auth/register", { method: "POST", body: datos, auth: false });

export const enviarContacto = (datos) =>
  pedir("/api/contacto", { method: "POST", body: datos, auth: false });

export const obtenerCursos = () => pedir("/api/courses", { auth: false });

export const obtenerCurso = (id) => pedir(`/api/courses/${id}`, { auth: false });

export const obtenerContenidoCurso = (id) => pedir(`/api/courses/${id}/content`);

export const actualizarProgresoModulo = (courseId, moduleId, completed) =>
  pedir(`/api/courses/${courseId}/modules/${moduleId}`, {
    method: "PUT",
    body: { completed },
  });

export const obtenerCertificado = (courseId) =>
  pedir(`/api/certificates/${courseId}`);

export const comprarCurso = (datos) =>
  pedir("/api/courses/buy", { method: "POST", body: datos });

export const obtenerFaqs = () => pedir("/api/faqs", { auth: false });

export const obtenerImpacto = () => pedir("/api/impact", { auth: false });

export const obtenerCatalogoAcciones = () =>
  pedir("/api/actions/catalog", { auth: false });

export const obtenerMisEnvios = () => pedir("/api/actions/mine");

export const enviarEvidencia = (datos) =>
  pedir("/api/actions", { method: "POST", body: datos });

export const obtenerPanel = () => pedir("/api/dashboard");

export const obtenerCursosAdmin = () => pedir("/api/admin/courses");

export const crearCurso = (datos) =>
  pedir("/api/admin/courses", { method: "POST", body: datos });

export const actualizarCurso = (id, datos) =>
  pedir(`/api/admin/courses/${id}`, { method: "PUT", body: datos });

export const archivarCurso = (id) =>
  pedir(`/api/admin/courses/${id}/archive`, { method: "PUT" });

export const eliminarCurso = (id) =>
  pedir(`/api/admin/courses/${id}`, { method: "DELETE" });

export const obtenerAccionesAdmin = () => pedir("/api/admin/action-catalog");

export const crearAccion = (datos) =>
  pedir("/api/admin/action-catalog", { method: "POST", body: datos });

export const actualizarAccion = (id, datos) =>
  pedir(`/api/admin/action-catalog/${id}`, { method: "PUT", body: datos });

export const archivarAccion = (id) =>
  pedir(`/api/admin/action-catalog/${id}/archive`, { method: "PUT" });

export const eliminarAccion = (id) =>
  pedir(`/api/admin/action-catalog/${id}`, { method: "DELETE" });

export const obtenerEnviosPendientes = () => pedir("/api/admin/actions/pending");

export const revisarEnvio = (id, status, note = "") =>
  pedir(`/api/admin/actions/${id}`, { method: "PUT", body: { status, note } });

export const eliminarEnvio = (id) =>
  pedir(`/api/admin/actions/${id}`, { method: "DELETE" });

export const obtenerComprasAdmin = () => pedir("/api/admin/purchases");

export const obtenerFaqsAdmin = () => pedir("/api/admin/faqs");

export const crearFaq = (datos) =>
  pedir("/api/admin/faqs", { method: "POST", body: datos });

export const actualizarFaq = (id, datos) =>
  pedir(`/api/admin/faqs/${id}`, { method: "PUT", body: datos });

export const eliminarFaq = (id) =>
  pedir(`/api/admin/faqs/${id}`, { method: "DELETE" });

export const obtenerMensajesContacto = () => pedir("/api/admin/contact");

export const actualizarMensajeContacto = (id, read) =>
  pedir(`/api/admin/contact/${id}`, { method: "PUT", body: { read } });

export const eliminarMensajeContacto = (id) =>
  pedir(`/api/admin/contact/${id}`, { method: "DELETE" });
