import { getApiBaseUrl } from "./env.js";

export const DEFAULT_COURSE_IMAGE = "/assets/img/Compostando.jpg";

export const escapeHtml = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);

export const formatDate = (value, options = {}) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("es-UY", options);
};

export const formatShortDate = (value) => formatDate(value, {
    year: "numeric",
    month: "short",
    day: "numeric"
});

export const formatMoney = (value, currency = "UYU") => {
    const number = Number(value) || 0;
    const formatted = Number.isInteger(number) ? String(number) : number.toFixed(2);
    return `${formatted} ${currency}`;
};

export const roundMoney = (value) => Math.round(value * 100) / 100;

export const formatNumber = (value, decimals = 0) => {
    const number = Number(value) || 0;
    return number.toLocaleString("es-UY", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
};

export const resolveAssetUrl = (value, fallback = DEFAULT_COURSE_IMAGE) => {
    if (typeof value !== "string" || !value.trim()) return fallback;
    const url = value.trim();
    if (url.startsWith("/uploads/")) return `${getApiBaseUrl()}${url}`;
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) return url;
    return `/${url}`;
};

export const resolveEvidenceUrl = (value) => {
    if (typeof value !== "string" || !value.trim()) return null;
    const url = value.trim();
    if (url.startsWith("/uploads/")) return `${getApiBaseUrl()}${url}`;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return null;
};

export const safeExternalUrl = (value) => {
    if (typeof value !== "string") return null;
    const url = value.trim();
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return null;
};

export const isImageUrl = (url) => /\.(jpe?g|png|webp)(\?.*)?$/i.test(url || "");
