const FOCUSABLE_SELECTOR = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled]):not([type='hidden'])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])"
].join(",");

const isVisible = (element) => {
    if (!element || element.hasAttribute("hidden")) return false;
    if (element.getAttribute("aria-hidden") === "true") return false;
    if (element.disabled) return false;
    return element.getClientRects().length > 0;
};

export const getFocusable = (container) => {
    if (!container) return [];
    return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(isVisible);
};

export const trapFocus = (container, options = {}) => {
    const { onEscape, initialFocus } = options;
    const previousFocus = document.activeElement;
    let active = true;

    const focusInitial = () => {
        const target = initialFocus || getFocusable(container)[0];
        if (target && typeof target.focus === "function") {
            target.focus();
            return;
        }

        if (!container.hasAttribute("tabindex")) {
            container.setAttribute("tabindex", "-1");
        }
        container.focus();
    };

    const onKeyDown = (event) => {
        if (!active) return;

        if (event.key === "Escape") {
            event.preventDefault();
            if (typeof onEscape === "function") onEscape();
            return;
        }

        if (event.key !== "Tab") return;

        const focusable = getFocusable(container);
        if (focusable.length === 0) {
            event.preventDefault();
            container.focus();
            return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const current = document.activeElement;

        if (event.shiftKey) {
            if (current === first || !container.contains(current)) {
                event.preventDefault();
                last.focus();
            }
            return;
        }

        if (current === last || !container.contains(current)) {
            event.preventDefault();
            first.focus();
        }
    };

    document.addEventListener("keydown", onKeyDown);
    focusInitial();

    return {
        release(shouldRestoreFocus = true) {
            if (!active) return;
            active = false;
            document.removeEventListener("keydown", onKeyDown);
            if (shouldRestoreFocus && previousFocus && typeof previousFocus.focus === "function" && document.contains(previousFocus)) {
                previousFocus.focus();
            }
        }
    };
};
