document.addEventListener("DOMContentLoaded", () => {
    const { session, api, format, events, domain } = window.EcoCampus;
    const grid = document.getElementById("courses-grid");
    const tabButtons = Array.from(document.querySelectorAll("[data-course-filter]"));
    const searchInput = document.getElementById("course-search-input");
    const levelFilter = document.getElementById("course-level-filter");
    const paymentFilter = document.getElementById("course-payment-filter");
    const clearFiltersButton = document.getElementById("course-clear-filters");
    const resultsInfo = document.getElementById("course-results-info");

    if (!grid) return;

    const fallbackImage = format.DEFAULT_COURSE_IMAGE;
    let courses = [];
    let activeFilter = "all";
    let searchTerm = "";
    let selectedLevel = "all";
    let selectedPayment = "all";

    const createCourseCard = (course, isOwned) => {
        const article = document.createElement("article");
        article.className = isOwned ? "course-card is-owned" : "course-card";
        article.dataset.courseId = course._id;

        const media = document.createElement("div");
        media.className = "course-media";

        const image = document.createElement("img");
        image.src = format.resolveAssetUrl(course.image);
        image.alt = course.title || "Curso de EcoCampus";
        image.loading = "lazy";
        image.addEventListener("error", () => {
            image.src = fallbackImage;
        }, { once: true });

        const tag = document.createElement("span");
        tag.className = "course-tag";
        tag.textContent = `${Number(course.modulesCount) || 0} módulos`;

        media.append(image, tag);

        if (isOwned) {
            const ownedBadge = document.createElement("span");
            ownedBadge.className = "course-owned-badge";
            ownedBadge.textContent = "Comprado";
            media.appendChild(ownedBadge);
        }

        const body = document.createElement("div");
        body.className = "course-body";

        const title = document.createElement("h2");
        title.className = "course-name";

        const titleButton = document.createElement("button");
        titleButton.type = "button";
        titleButton.className = "course-name-btn";
        titleButton.setAttribute("aria-haspopup", "dialog");
        titleButton.textContent = course.title;

        title.appendChild(titleButton);

        const duration = document.createElement("p");
        duration.className = "course-duration";
        duration.textContent = `Duración: ${course.duration}`;

        const description = document.createElement("p");
        description.className = "course-description";
        description.textContent = course.description;

        const badges = document.createElement("div");
        badges.className = "course-badges";

        const levelBadge = document.createElement("span");
        levelBadge.className = "course-badge course-badge-level";
        levelBadge.textContent = domain.courses.getCourseLevelLabel(course.level);

        const paymentType = domain.courses.getCoursePaymentType(course);
        const paymentBadge = document.createElement("span");
        paymentBadge.className = `course-badge course-badge-payment ${paymentType}`;
        paymentBadge.textContent = domain.courses.getCoursePaymentLabel(paymentType);

        badges.append(levelBadge, paymentBadge);
        body.append(badges, title, duration, description);
        article.append(media, body);

        const openCourse = () => {
            if (typeof window.abrirModalCurso === "function") {
                window.abrirModalCurso(course);
            }
        };

        article.addEventListener("click", openCourse);

        return article;
    };

    const showEmptyState = (message, withLoginLink = false) => {
        grid.replaceChildren();
        const empty = document.createElement("p");
        empty.className = "public-empty";
        empty.textContent = message;

        if (withLoginLink) {
            const link = document.createElement("a");
            link.className = "public-empty-link";
            link.href = "/account.html";
            link.textContent = "Iniciar sesión";
            empty.appendChild(link);
        }

        grid.appendChild(empty);
    };

    const showFilterEmptyState = () => {
        grid.replaceChildren();
        const empty = document.createElement("div");
        empty.className = "public-empty";

        const text = document.createElement("p");
        text.textContent = "No encontramos cursos con esos filtros.";

        const button = document.createElement("button");
        button.type = "button";
        button.className = "course-clear-btn";
        button.textContent = "Limpiar filtros";
        button.addEventListener("click", resetFilters);

        empty.append(text, button);
        grid.appendChild(empty);
    };

    const updateResultsInfo = (visibleCount, totalCount) => {
        if (!resultsInfo) return;
        const query = searchTerm.trim();
        const suffix = query ? ` para “${query}”` : "";

        if (visibleCount === totalCount) {
            resultsInfo.textContent = `${visibleCount} ${visibleCount === 1 ? "curso disponible" : "cursos disponibles"}${suffix}`;
        } else {
            resultsInfo.textContent = `${visibleCount} de ${totalCount} cursos${suffix}`;
        }
    };

    const renderCourses = () => {
        const user = session.getUser();
        const ownedIds = domain.courses.getOwnedCourseIds(user);
        const isAdmin = user?.role === "admin";

        if (activeFilter === "owned" && !user) {
            if (resultsInfo) resultsInfo.textContent = "";
            showEmptyState("Iniciá sesión para ver tus cursos.", true);
            return;
        }

        if (activeFilter === "owned" && isAdmin) {
            if (resultsInfo) resultsInfo.textContent = "";
            showEmptyState("Como administrador podés acceder a todos los cursos desde “Todos los cursos”.");
            return;
        }

        const baseCourses = activeFilter === "owned"
            ? courses.filter((course) => ownedIds.includes(String(course._id)))
            : courses;

        if (baseCourses.length === 0) {
            if (resultsInfo) resultsInfo.textContent = "";
            showEmptyState(activeFilter === "owned"
                ? "Todavía no compraste ningún curso."
                : "Todavía no hay cursos disponibles.");
            return;
        }

        const visibleCourses = baseCourses.filter((course) => domain.courses.matchesCourseFilters(course, {
            searchTerm,
            level: selectedLevel,
            payment: selectedPayment
        }));
        updateResultsInfo(visibleCourses.length, baseCourses.length);

        if (visibleCourses.length === 0) {
            showFilterEmptyState();
            return;
        }

        grid.replaceChildren();
        visibleCourses.forEach((course) => {
            grid.appendChild(createCourseCard(course, ownedIds.includes(String(course._id))));
        });
    };

    const resetFilters = () => {
        searchTerm = "";
        selectedLevel = "all";
        selectedPayment = "all";

        if (searchInput) searchInput.value = "";
        if (levelFilter) levelFilter.value = "all";
        if (paymentFilter) paymentFilter.value = "all";

        renderCourses();
    };

    const loadCourses = async () => {
        try {
            const payload = await api.get("/api/courses", { auth: false });
            courses = Array.isArray(payload.data) ? payload.data : [];
            renderCourses();
        } catch (error) {
            console.error("Error al cargar los cursos:", error);
            showEmptyState("No se pudieron cargar los cursos. Intentá nuevamente más tarde.");
        }
    };

    tabButtons.forEach((button) => {
        button.addEventListener("click", () => {
            activeFilter = button.dataset.courseFilter === "owned" ? "owned" : "all";
            tabButtons.forEach((item) => {
                const isActive = item === button;
                item.classList.toggle("is-active", isActive);
                item.setAttribute("aria-selected", String(isActive));
            });
            renderCourses();
        });
    });

    if (searchInput) {
        searchInput.addEventListener("input", () => {
            searchTerm = searchInput.value;
            renderCourses();
        });
    }

    if (levelFilter) {
        levelFilter.addEventListener("change", () => {
            selectedLevel = levelFilter.value;
            renderCourses();
        });
    }

    if (paymentFilter) {
        paymentFilter.addEventListener("change", () => {
            selectedPayment = paymentFilter.value;
            renderCourses();
        });
    }

    if (clearFiltersButton) {
        clearFiltersButton.addEventListener("click", resetFilters);
    }

    events.on(events.EVENTS.coursesUpdated, renderCourses);
    window.addEventListener("storage", (event) => {
        if (event.key === "userEcoCampus") renderCourses();
    });

    loadCourses();
});
