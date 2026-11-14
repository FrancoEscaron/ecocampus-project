export const EVENTS = {
    coursesUpdated: "ecocampus:courses-updated",
    sessionChanged: "ecocampus:session-changed"
};

export const emit = (name, detail) => window.dispatchEvent(new CustomEvent(name, { detail }));

export const on = (name, handler) => window.addEventListener(name, handler);
