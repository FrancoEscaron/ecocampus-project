import { formatMoney } from "../core/format.js";

export const COURSE_LEVEL_LABELS = {
    principiante: "Principiante",
    intermedio: "Intermedio",
    avanzado: "Avanzado",
    todos: "Apto para todos"
};

export const COURSE_PAYMENT_LABELS = {
    points: "100% Eco-Points",
    mixed: "Pago mixto",
    money: "Pago con dinero",
    free: "Gratuito"
};

export const getCourseLevelLabel = (level) => COURSE_LEVEL_LABELS[level] || COURSE_LEVEL_LABELS.todos;

export const getCoursePaymentType = (course = {}) => {
    const points = Number(course.pointsCost) || 0;
    const price = Number(course.price) || 0;
    if (points > 0 && price > 0) return "mixed";
    if (points > 0) return "points";
    if (price > 0) return "money";
    return "free";
};

export const getCoursePaymentLabel = (type) => COURSE_PAYMENT_LABELS[type] || COURSE_PAYMENT_LABELS.free;

export const getCoursePaymentLabelFromCosts = (pointsCost, price) =>
    getCoursePaymentLabel(getCoursePaymentType({ pointsCost, price }));

export const getCourseCostLabel = (course = {}) => {
    const pointsCost = Math.max(0, Math.floor(Number(course.pointsCost) || 0));
    const price = Math.max(0, Number(course.price) || 0);
    const currency = course.currency || "UYU";

    if (pointsCost > 0 && price > 0) return `${pointsCost} Eco-Points o ${formatMoney(price, currency)}`;
    if (pointsCost > 0) return `${pointsCost} Eco-Points`;
    if (price > 0) return formatMoney(price, currency);
    return "Gratis";
};

export const getOwnedCourseIds = (user) =>
    Array.isArray(user?.coursesOwned) ? user.coursesOwned.map(String) : [];

export const matchesCourseFilters = (course = {}, filters = {}) => {
    const { searchTerm = "", level = "all", payment = "all" } = filters;
    const query = String(searchTerm).trim().toLowerCase();
    const searchable = `${course.title || ""} ${course.description || ""}`.toLowerCase();

    if (query && !searchable.includes(query)) return false;
    if (level !== "all" && (course.level || "todos") !== level) return false;
    if (payment !== "all" && getCoursePaymentType(course) !== payment) return false;

    return true;
};
