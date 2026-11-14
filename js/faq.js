document.addEventListener("DOMContentLoaded", () => {
    const { api } = window.EcoCampus;
    const container = document.getElementById("faq-container");

    if (!container) return;

    const createFaqItem = (faq) => {
        const details = document.createElement("details");
        details.className = "faq-item";

        const summary = document.createElement("summary");
        summary.textContent = faq.question;

        const answer = document.createElement("p");
        answer.textContent = faq.answer;

        details.append(summary, answer);
        return details;
    };

    const showEmptyState = (message) => {
        container.replaceChildren();
        const empty = document.createElement("p");
        empty.className = "public-empty";
        empty.textContent = message;
        container.appendChild(empty);
    };

    const loadFaqs = async () => {
        try {
            const payload = await api.get("/api/faqs", { auth: false });
            const faqs = Array.isArray(payload.data) ? payload.data : [];

            if (faqs.length === 0) {
                showEmptyState("Todavía no hay preguntas frecuentes cargadas.");
                return;
            }

            container.replaceChildren();
            faqs.forEach((faq) => {
                container.appendChild(createFaqItem(faq));
            });
        } catch (error) {
            console.error("Error al cargar las preguntas frecuentes:", error);
            showEmptyState("No se pudieron cargar las preguntas frecuentes. Intentá nuevamente más tarde.");
        }
    };

    loadFaqs();
});
