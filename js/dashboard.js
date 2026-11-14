document.addEventListener("DOMContentLoaded", () => {
    const { session, api, format, domain } = window.EcoCampus;
    const token = session.getToken();
    const feedback = document.getElementById("dashboard-feedback");
    const content = document.getElementById("dashboard-content");

    if (!token) {
        window.location.href = "/account.html";
        return;
    }

    const fallbackImage = format.DEFAULT_COURSE_IMAGE;

    const logout = (confirmFirst = true) => {
        if (confirmFirst && !confirm("¿Querés cerrar sesión?")) return;
        session.clearSession();
        window.location.href = "/index.html";
    };

    document.getElementById("dashboard-logout")?.addEventListener("click", () => logout(true));

    const setFeedback = (message, type = "") => {
        feedback.textContent = message;
        feedback.className = type ? `dashboard-msg ${type}` : "dashboard-msg";
        feedback.hidden = !message;
    };

    const createEmptyState = (message, linkHref, linkText) => {
        const wrapper = document.createElement("div");
        wrapper.className = "dashboard-empty";

        const text = document.createElement("p");
        text.textContent = message;
        wrapper.appendChild(text);

        if (linkHref && linkText) {
            const link = document.createElement("a");
            link.className = "dashboard-empty-link";
            link.href = linkHref;
            link.textContent = linkText;
            wrapper.appendChild(link);
        }

        return wrapper;
    };

    const createStatCard = (label, value, hint) => {
        const card = document.createElement("article");
        card.className = "dashboard-stat-card";

        const labelElement = document.createElement("p");
        labelElement.className = "dashboard-stat-label";
        labelElement.textContent = label;

        const valueElement = document.createElement("p");
        valueElement.className = "dashboard-stat-value";
        valueElement.textContent = String(value);

        const hintElement = document.createElement("p");
        hintElement.className = "dashboard-stat-hint";
        hintElement.textContent = hint;

        card.append(labelElement, valueElement, hintElement);
        return card;
    };

    const renderProfile = (user) => {
        document.getElementById("dashboard-user-name").textContent = `${user.name} ${user.lastName}`.trim();
        document.getElementById("dashboard-user-email").textContent = user.email;
        document.getElementById("dashboard-user-since").textContent = user.memberSince
            ? `Miembro desde ${format.formatShortDate(user.memberSince)}`
            : "";
    };

    const renderStats = (data) => {
        const container = document.getElementById("dashboard-stats");
        container.replaceChildren();
        container.append(
            createStatCard("Eco-Points", data.user.ecoPoints, "Saldo disponible"),
            createStatCard("Acciones pendientes", data.stats.pending, "En revisión"),
            createStatCard("Acciones aprobadas", data.stats.approved, `${data.stats.pointsEarned} puntos ganados`),
            createStatCard("Cursos desbloqueados", data.stats.coursesOwned, "Disponibles en tu panel")
        );
    };

    const renderCourses = (courses) => {
        const container = document.getElementById("dashboard-courses");
        container.replaceChildren();

        if (courses.length === 0) {
            container.appendChild(createEmptyState("Todavía no desbloqueaste ningún curso.", "/courses.html", "Ver cursos"));
            return;
        }

        courses.forEach((course) => {
            const card = document.createElement("article");
            card.className = "dashboard-course-card";

            const image = document.createElement("img");
            image.className = "dashboard-course-image";
            image.src = format.resolveAssetUrl(course.image);
            image.alt = course.title || "Curso de EcoCampus";
            image.loading = "lazy";
            image.addEventListener("error", () => {
                image.src = fallbackImage;
            }, { once: true });

            const info = document.createElement("div");
            info.className = "dashboard-course-info";

            const title = document.createElement("h3");
            title.textContent = course.title;

            const meta = document.createElement("p");
            meta.className = "dashboard-course-meta";
            meta.textContent = `${course.duration || "Duración no disponible"} · ${Number(course.modulesCount) || 0} módulos`;

            const cost = document.createElement("p");
            cost.className = "dashboard-course-cost";
            cost.textContent = `${Number(course.pointsCost) || 0} Eco-Points`;

            const button = document.createElement("button");
            button.type = "button";
            button.className = "dashboard-course-btn";
            button.textContent = "Ver curso";
            button.addEventListener("click", () => {
                if (typeof window.abrirModalCurso === "function") {
                    window.abrirModalCurso(course);
                }
            });

            info.append(title, meta, cost, button);
            card.append(image, info);
            container.appendChild(card);
        });
    };

    const renderSubmissions = (submissions) => {
        const container = document.getElementById("dashboard-submissions");
        container.replaceChildren();

        if (submissions.length === 0) {
            container.appendChild(createEmptyState("Todavía no enviaste acciones.", "/validate.html", "Validar acción"));
            return;
        }

        submissions.forEach((submission) => {
            const item = document.createElement("article");
            item.className = "submission-item dashboard-submission-item";

            const info = document.createElement("div");
            info.className = "submission-info";

            const title = document.createElement("h3");
            title.textContent = submission.actionType || "Acción";

            const description = document.createElement("p");
            description.textContent = submission.description || "Sin descripción.";

            const meta = document.createElement("p");
            const quantity = Number(submission.quantity);
            const quantityText = quantity > 0 ? `${quantity} ${submission.unit || "acciones"} · ` : "";
            meta.textContent = `${quantityText}Puntos: ${Number(submission.pointsValue) || 0} · ${format.formatShortDate(submission.submittedAt)}`;

            info.append(title, description, meta);

            const side = document.createElement("div");
            side.className = "dashboard-submission-side";

            const status = document.createElement("span");
            status.className = `submission-status ${submission.status}`;
            status.textContent = domain.actions.getSubmissionStatusLabel(submission.status);
            side.appendChild(status);

            const evidenceUrl = format.resolveEvidenceUrl(submission.evidenceUrl);
            if (evidenceUrl) {
                const evidence = document.createElement("a");
                evidence.className = "submission-evidence-link";
                evidence.href = evidenceUrl;
                evidence.target = "_blank";
                evidence.rel = "noopener noreferrer";
                evidence.textContent = "Ver evidencia";
                side.appendChild(evidence);
            } else {
                const missing = document.createElement("span");
                missing.className = "submission-evidence-missing";
                missing.textContent = "Sin evidencia";
                side.appendChild(missing);
            }

            item.append(info, side);
            container.appendChild(item);
        });
    };

    const renderPurchases = (purchases) => {
        const container = document.getElementById("dashboard-purchases");
        container.replaceChildren();

        if (purchases.length === 0) {
            container.appendChild(createEmptyState("Todavía no realizaste compras.", "/courses.html", "Ver cursos"));
            return;
        }

        purchases.forEach((purchase) => {
            const item = document.createElement("article");
            item.className = "submission-item dashboard-purchase-item";

            const info = document.createElement("div");
            info.className = "submission-info";

            const title = document.createElement("h3");
            title.textContent = purchase.course?.title || "Curso eliminado";

            const { moneySpent } = domain.purchases.getPurchaseParts(purchase);
            const meta = document.createElement("p");
            meta.textContent = `${domain.purchases.getPurchaseSummary(purchase)} · ${format.formatShortDate(purchase.purchasedAt)}`;

            info.append(title, meta);

            if (moneySpent > 0) {
                const simulated = document.createElement("span");
                simulated.className = "purchase-simulated-badge";
                simulated.textContent = "Pago simulado";
                info.appendChild(simulated);
            }

            if (purchase.refundedAt) {
                const refunded = document.createElement("span");
                refunded.className = "submission-status rejected";
                refunded.textContent = "Reembolsado";
                info.appendChild(refunded);
            }

            item.appendChild(info);
            container.appendChild(item);
        });
    };

    const renderDashboard = (data) => {
        renderProfile(data.user);
        renderStats(data);
        renderCourses(data.courses);
        renderSubmissions(data.submissions);
        renderPurchases(data.purchases);

        try {
            const stored = session.getUser() || {};
            session.setUser({
                ...stored,
                ecoPoints: data.user.ecoPoints,
                coursesOwned: (data.courses || []).map((course) => course._id)
            });
        } catch {
            session.clearSession();
        }

        setFeedback("", "");
        content.hidden = false;
    };

    const loadDashboard = async () => {
        try {
            const { response, data } = await api.request("/api/dashboard", {
                redirectOnUnauthorized: false
            });

            if (response.status === 401) {
                logout(false);
                return;
            }

            if (!data?.success) {
                throw new Error(data?.message || "No se pudo cargar tu panel.");
            }

            renderDashboard(data.data);
        } catch (error) {
            console.error("Error al cargar el panel:", error);
            setFeedback("No se pudo cargar tu panel. Intentá nuevamente más tarde.", "error");
        }
    };

    loadDashboard();
});
