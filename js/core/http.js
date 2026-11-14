import { getApiBaseUrl } from "./env.js";
import { clearSession, getToken } from "./session.js";

export class ApiError extends Error {
    constructor(message, status, payload) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.payload = payload;
    }
}

const isFormData = (body) => typeof FormData !== "undefined" && body instanceof FormData;
const isBlob = (body) => typeof Blob !== "undefined" && body instanceof Blob;
const isSearchParams = (body) => typeof URLSearchParams !== "undefined" && body instanceof URLSearchParams;

const buildUrl = (path) => {
    if (/^https?:\/\//i.test(path)) return path;
    const base = getApiBaseUrl();
    return `${base}${path.startsWith("/") ? path : `/${path}`}`;
};

export const request = async (path, options = {}) => {
    const {
        auth = true,
        redirectOnUnauthorized = true,
        headers: customHeaders = {},
        body,
        ...rest
    } = options;

    const headers = { ...customHeaders };
    const token = getToken();

    if (auth && token) headers.Authorization = `Bearer ${token}`;

    const rawBody = isFormData(body) || isBlob(body) || isSearchParams(body);
    const payload = rawBody || body === undefined || body === null
        ? body
        : typeof body === "string"
            ? body
            : JSON.stringify(body);

    if (body && !isFormData(body) && !isSearchParams(body) && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
    }

    const response = await fetch(buildUrl(path), { ...rest, body: payload, headers });
    let data = null;

    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (response.status === 401 && redirectOnUnauthorized) {
        clearSession();
        window.location.href = "/account.html";
        throw new ApiError(data?.message || "Sesión vencida.", 401, data);
    }

    return { response, data };
};

export const requestData = async (path, options = {}) => {
    const { response, data } = await request(path, options);

    if (!response.ok || !data?.success) {
        throw new ApiError(data?.message || "Ocurrió un error.", response.status, data);
    }

    return data;
};

export const get = (path, options = {}) => requestData(path, { ...options, method: "GET" });

export const post = (path, body, options = {}) => requestData(path, { ...options, method: "POST", body });

export const put = (path, body, options = {}) => requestData(path, { ...options, method: "PUT", body });

export const del = (path, options = {}) => requestData(path, { ...options, method: "DELETE" });

export const upload = (path, body, options = {}) => requestData(path, { ...options, method: "POST", body });
