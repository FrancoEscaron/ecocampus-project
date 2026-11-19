import { formatMoney } from "./format";

export const COURSE_LEVEL_LABELS = {
  principiante: "Principiante",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
  todos: "Apto para todos",
};

export const COURSE_PAYMENT_LABELS = {
  points: "100% Eco-Points",
  mixed: "Pago mixto",
  money: "Pago con dinero",
  free: "Gratuito",
};

export const getCourseLevelLabel = (level) =>
  COURSE_LEVEL_LABELS[level] || COURSE_LEVEL_LABELS.todos;

export const getCoursePaymentType = (curso = {}) => {
  const points = Number(curso.pointsCost) || 0;
  const price = Number(curso.price) || 0;
  if (points > 0 && price > 0) return "mixed";
  if (points > 0) return "points";
  if (price > 0) return "money";
  return "free";
};

export const getCoursePaymentLabel = (type) =>
  COURSE_PAYMENT_LABELS[type] || COURSE_PAYMENT_LABELS.free;

export const getCoursePaymentLabelFromCosts = (pointsCost, price) =>
  getCoursePaymentLabel(getCoursePaymentType({ pointsCost, price }));

export const getModulesLabel = (count) => {
  const total = Math.max(0, Math.floor(Number(count) || 0));
  return `${total} ${total === 1 ? "módulo" : "módulos"}`;
};

export const getOwnedCourseIds = (usuario) =>
  Array.isArray(usuario?.coursesOwned) ? usuario.coursesOwned.map(String) : [];

export const matchesCourseFilters = (curso = {}, filtros = {}) => {
  const { searchTerm = "", level = "all", payment = "all" } = filtros;
  const consulta = String(searchTerm).trim().toLowerCase();
  const buscable = `${curso.title || ""} ${curso.description || ""}`.toLowerCase();

  if (consulta && !buscable.includes(consulta)) return false;
  if (level !== "all" && (curso.level || "todos") !== level) return false;
  if (payment !== "all" && getCoursePaymentType(curso) !== payment) return false;

  return true;
};

export const getCourseCostLabel = (curso = {}) => {
  const pointsCost = Math.max(0, Math.floor(Number(curso.pointsCost) || 0));
  const price = Math.max(0, Number(curso.price) || 0);
  const currency = curso.currency || "UYU";

  if (pointsCost > 0 && price > 0) return `${pointsCost} Eco-Points o ${formatMoney(price, currency)}`;
  if (pointsCost > 0) return `${pointsCost} Eco-Points`;
  if (price > 0) return formatMoney(price, currency);
  return "Gratis";
};
