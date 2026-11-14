document.addEventListener("DOMContentLoaded", async () => {
    const { session, api, format, domain } = window.EcoCampus;

    if (!session.requireSession({ admin: true })) return;

    const showMessage = (elementId, text, type = "success") => {
        const container = document.getElementById(elementId);
        if (!container) return;

        container.textContent = "";
        const msgDiv = document.createElement("div");
        msgDiv.className = `admin-msg ${type}`;
        msgDiv.textContent = text;

        container.appendChild(msgDiv);
        setTimeout(() => { msgDiv.remove(); }, 4000);
    };

    const showApiError = (elementId, data) => {
        const detail = Array.isArray(data?.errors) ? ` ${data.errors.join(" ")}` : "";
        showMessage(elementId, `${data?.message || "Ocurrió un error."}${detail}`, "error");
    };

    const createCard = ({ imageUrl, title, meta, price, description, badge, actions }) => {
        const item = document.createElement("div");
        item.className = "admin-card-item";

        const info = document.createElement("div");
        info.className = "admin-card-info";

        if (imageUrl) {
            const image = document.createElement("img");
            image.src = imageUrl;
            image.alt = title;
            image.className = "admin-card-thumb";
            info.appendChild(image);
        }

        const text = document.createElement("div");
        text.className = "admin-card-text";

        const heading = document.createElement("h3");
        heading.className = "admin-card-title";
        heading.textContent = title;
        text.appendChild(heading);

        if (meta) {
            const metaLine = document.createElement("p");
            metaLine.className = "admin-card-meta";
            metaLine.textContent = meta;
            text.appendChild(metaLine);
        }

        if (price) {
            const priceLine = document.createElement("p");
            priceLine.className = "admin-card-price";
            priceLine.textContent = price;
            text.appendChild(priceLine);
        }

        if (description) {
            const descriptionLine = document.createElement("p");
            descriptionLine.className = "admin-card-description";
            descriptionLine.textContent = description;
            text.appendChild(descriptionLine);
        }

        if (badge) {
            const badgeEl = document.createElement("span");
            badgeEl.className = `admin-status-badge ${badge.className}`;
            badgeEl.textContent = badge.text;
            text.appendChild(badgeEl);
        }

        info.appendChild(text);

        const actionWrapper = document.createElement("div");
        actionWrapper.className = "admin-card-actions";
        actions.forEach(({ label, className, onClick, disabled, title: actionTitle }) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = className;
            button.textContent = label;
            if (disabled) button.disabled = true;
            if (actionTitle) button.title = actionTitle;
            button.addEventListener("click", onClick);
            actionWrapper.appendChild(button);
        });

        item.append(info, actionWrapper);
        return item;
    };

    const createEmptyState = (message) => {
        const empty = document.createElement("p");
        empty.className = "admin-empty";
        empty.textContent = message;
        return empty;
    };

    const tabButtons = document.querySelectorAll(".admin-tab-btn");
    const viewContents = document.querySelectorAll(".admin-view-content");

    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            tabButtons.forEach(b => b.classList.remove("active"));
            viewContents.forEach(v => v.classList.remove("active"));

            btn.classList.add("active");
            const target = btn.getAttribute("data-target");
            document.getElementById(target).classList.add("active");

            if (target === "view-actions") loadActionCatalog();
            if (target === "view-deliveries") loadPendingSubmissions();
            if (target === "view-payments") loadPurchases();
        });
    });

    const courseFormContainer = document.getElementById("course-form-container");
    const courseForm = document.getElementById("create-course-form");
    const courseIdInput = document.getElementById("course-id");
    const courseFormTitle = document.getElementById("course-form-title");
    const courseSubmitBtn = document.getElementById("course-submit-btn");
    const courseImageInput = document.getElementById("image");
    const paymentTypePreview = document.getElementById("paymentTypePreview");

    const updatePaymentTypePreview = () => {
        if (!paymentTypePreview) return;
        paymentTypePreview.value = domain.courses.getCoursePaymentLabelFromCosts(
            document.getElementById("pointsCost").value,
            document.getElementById("price").value
        );
    };

    document.getElementById("pointsCost").addEventListener("input", updatePaymentTypePreview);
    document.getElementById("price").addEventListener("input", updatePaymentTypePreview);
    updatePaymentTypePreview();

    const openCourseForm = (course = null) => {
        courseForm.reset();
        courseIdInput.value = course?._id || "";
        courseFormTitle.textContent = course ? "Editar curso" : "Nuevo curso";
        courseSubmitBtn.textContent = course ? "Actualizar curso" : "Guardar curso";
        courseImageInput.required = !course;
        document.getElementById("pointsCost").value = course?.pointsCost ?? 30;
        document.getElementById("level").value = course?.level || "todos";

        if (course) {
            document.getElementById("title").value = course.title || "";
            document.getElementById("duration").value = course.duration || "";
            document.getElementById("modulesCount").value = course.modulesCount ?? "";
            document.getElementById("price").value = course.price ?? 0;
            document.getElementById("currency").value = course.currency || "UYU";
            document.getElementById("description").value = course.description || "";
            document.getElementById("contentDetails").value = course.contentDetails || "";
            document.getElementById("videoUrl").value = course.videoUrl || "";
            document.getElementById("pdfUrl").value = course.pdfUrl || "";
        }

        updatePaymentTypePreview();
        courseFormContainer.classList.add("is-open");
        courseFormContainer.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const closeCourseForm = () => {
        courseFormContainer.classList.remove("is-open");
        courseForm.reset();
        courseIdInput.value = "";
        courseFormTitle.textContent = "Nuevo curso";
        courseSubmitBtn.textContent = "Guardar curso";
        courseImageInput.required = true;
        updatePaymentTypePreview();
    };

    document.getElementById("open-create-course-btn").addEventListener("click", () => openCourseForm());
    document.getElementById("cancel-course-btn").addEventListener("click", closeCourseForm);

    const loadAdminCourses = async () => {
        try {
            const { data } = await api.request("/api/admin/courses");
            const courses = Array.isArray(data?.data) ? data.data : [];
            const container = document.getElementById("courses-admin-container");
            container.replaceChildren();

            if (!data?.success) {
                showApiError("courses-feedback", data);
                return;
            }

            if (courses.length === 0) {
                container.appendChild(createEmptyState("Todavía no hay cursos."));
                return;
            }

            courses.forEach(course => {
                const meta = `${course.duration} · ${course.modulesCount} módulos · ${domain.courses.getCourseLevelLabel(course.level)}`;
                const price = `${course.pointsCost ?? 0} Eco-Points · ${course.price ?? 0} ${course.currency || "UYU"} · ${domain.courses.getCoursePaymentLabelFromCosts(course.pointsCost, course.price)}`;

                container.appendChild(createCard({
                    imageUrl: format.resolveAssetUrl(course.image, null),
                    title: course.title,
                    meta,
                    price,
                    description: course.description,
                    badge: course.archived ? { className: "archived", text: "Archivado" } : null,
                    actions: [
                        {
                            label: "Editar",
                            className: "admin-btn-neutral",
                            onClick: () => openCourseForm(course)
                        },
                        {
                            label: course.archived ? "Reactivar" : "Archivar",
                            className: "admin-btn-neutral",
                            onClick: () => archiveCourse(course._id)
                        },
                        {
                            label: "Eliminar",
                            className: "admin-btn-delete",
                            onClick: () => deleteCourse(course._id)
                        }
                    ]
                }));
            });
        } catch (err) {
            console.error("Error cargando cursos:", err);
            showApiError("courses-feedback", { message: "No se pudieron cargar los cursos." });
        }
    };

    const deleteCourse = async (id) => {
        if (!confirm("¿Estás seguro de eliminar este curso?")) return;
        try {
            const { data } = await api.request(`/api/admin/courses/${id}`, { method: "DELETE" });
            if (data?.success) {
                showMessage("courses-feedback", data?.message || "Curso eliminado.", "success");
                loadAdminCourses();
            } else {
                showApiError("courses-feedback", data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const archiveCourse = async (id) => {
        try {
            const { data } = await api.request(`/api/admin/courses/${id}/archive`, { method: "PUT" });
            if (data?.success) {
                showMessage("courses-feedback", data?.message || "Curso actualizado.", "success");
                loadAdminCourses();
            } else {
                showApiError("courses-feedback", data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    courseForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const id = courseIdInput.value;
        const formData = new FormData();
        formData.append("title", document.getElementById("title").value.trim());
        formData.append("description", document.getElementById("description").value.trim());
        formData.append("duration", document.getElementById("duration").value.trim());
        formData.append("modulesCount", Number(document.getElementById("modulesCount").value));
        formData.append("level", document.getElementById("level").value);
        formData.append("pointsCost", Number(document.getElementById("pointsCost").value));
        formData.append("price", Number(document.getElementById("price").value));
        formData.append("currency", document.getElementById("currency").value);
        formData.append("contentDetails", document.getElementById("contentDetails").value.trim());
        formData.append("videoUrl", document.getElementById("videoUrl").value.trim());
        formData.append("pdfUrl", document.getElementById("pdfUrl").value.trim());

        if (courseImageInput.files[0]) {
            formData.append("image", courseImageInput.files[0]);
        }

        const url = id ? `/api/admin/courses/${id}` : "/api/admin/courses";
        const method = id ? "PUT" : "POST";

        try {
            const { data } = await api.request(url, { method, body: formData });
            if (data?.success) {
                showMessage("courses-feedback", data?.message || (id ? "Curso actualizado con éxito." : "Curso creado con éxito."), "success");
                closeCourseForm();
                loadAdminCourses();
            } else {
                showApiError("course-feedback", data);
            }
        } catch (err) {
            console.error(err);
        }
    });

    const faqFormContainer = document.getElementById("faq-form-container");
    const faqForm = document.getElementById("create-faq-form");
    const faqIdInput = document.getElementById("faq-id");
    const faqFormTitle = document.getElementById("faq-form-title");
    const faqSubmitBtn = document.getElementById("faq-submit-btn");

    const openFaqForm = (faq = null) => {
        faqForm.reset();
        faqIdInput.value = faq?._id || "";
        faqFormTitle.textContent = faq ? "Editar pregunta frecuente" : "Nueva pregunta frecuente";
        faqSubmitBtn.textContent = faq ? "Actualizar pregunta" : "Guardar pregunta";

        if (faq) {
            document.getElementById("faq-question").value = faq.question || "";
            document.getElementById("faq-answer").value = faq.answer || "";
        }

        faqFormContainer.classList.add("is-open");
        faqFormContainer.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const closeFaqForm = () => {
        faqFormContainer.classList.remove("is-open");
        faqForm.reset();
        faqIdInput.value = "";
        faqFormTitle.textContent = "Nueva pregunta frecuente";
        faqSubmitBtn.textContent = "Guardar pregunta";
    };

    document.getElementById("open-create-faq-btn").addEventListener("click", () => openFaqForm());
    document.getElementById("cancel-faq-btn").addEventListener("click", closeFaqForm);

    const loadAdminFaqs = async () => {
        try {
            const { data } = await api.request("/api/admin/faqs");
            const faqs = Array.isArray(data?.data) ? data.data : [];
            const container = document.getElementById("faqs-admin-container");
            container.replaceChildren();

            if (!data?.success) {
                showApiError("faqs-feedback", data);
                return;
            }

            if (faqs.length === 0) {
                container.appendChild(createEmptyState("No hay preguntas frecuentes cargadas."));
                return;
            }

            faqs.forEach(faq => {
                container.appendChild(createCard({
                    title: faq.question,
                    description: faq.answer,
                    actions: [
                        {
                            label: "Editar",
                            className: "admin-btn-neutral",
                            onClick: () => openFaqForm(faq)
                        },
                        {
                            label: "Eliminar",
                            className: "admin-btn-delete",
                            onClick: () => deleteFaq(faq._id)
                        }
                    ]
                }));
            });
        } catch (err) {
            console.error("Error cargando FAQs:", err);
            showApiError("faqs-feedback", { message: "No se pudieron cargar las preguntas frecuentes." });
        }
    };

    const deleteFaq = async (id) => {
        if (!confirm("¿Estás seguro de eliminar esta pregunta frecuente?")) return;
        try {
            const { data } = await api.request(`/api/admin/faqs/${id}`, { method: "DELETE" });
            if (data?.success) {
                showMessage("faqs-feedback", data?.message || "Pregunta eliminada.", "success");
                loadAdminFaqs();
            } else {
                showApiError("faqs-feedback", data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    faqForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const id = faqIdInput.value;
        const faqData = {
            question: document.getElementById("faq-question").value.trim(),
            answer: document.getElementById("faq-answer").value.trim()
        };

        const url = id ? `/api/admin/faqs/${id}` : "/api/admin/faqs";
        const method = id ? "PUT" : "POST";

        try {
            const { data } = await api.request(url, {
                method,
                body: JSON.stringify(faqData)
            });
            if (data?.success) {
                showMessage("faqs-feedback", data?.message || (id ? "Pregunta actualizada." : "Pregunta creada."), "success");
                closeFaqForm();
                loadAdminFaqs();
            } else {
                showApiError("faq-feedback", data);
            }
        } catch (err) {
            console.error(err);
        }
    });

    const actionFormContainer = document.getElementById("action-form-container");
    const actionForm = document.getElementById("create-action-form");
    const actionIdInput = document.getElementById("action-id");
    const actionFormTitle = document.getElementById("action-form-title");
    const actionSubmitBtn = document.getElementById("action-submit-btn");
    const actionImageInput = document.getElementById("action-image");
    const actionKeyNote = document.getElementById("action-key-note");
    const actionImpactInput = document.getElementById("action-impact");
    const actionImpactHint = document.getElementById("action-impact-hint");
    const actionUnits = domain.actions.ACTION_IMPACT_UNITS;

    const updateActionImpactHint = () => {
        actionImpactHint.textContent = `Unidad: ${actionUnits[actionImpactInput.value] || "acciones"}`;
    };

    const openActionForm = (action = null) => {
        actionForm.reset();
        actionIdInput.value = action?._id || "";
        actionFormTitle.textContent = action ? "Editar acción" : "Nueva acción";
        actionSubmitBtn.textContent = action ? "Actualizar acción" : "Guardar acción";
        actionImageInput.required = !action;
        actionKeyNote.textContent = action
            ? `Clave: ${action.key}`
            : "La clave se genera automáticamente a partir del título.";
        actionImpactInput.value = action?.impactMetric || "residuos";
        document.getElementById("action-points").value = action?.pointsPerUnit ?? 10;
        document.getElementById("action-order").value = action?.order ?? 0;
        updateActionImpactHint();

        if (action) {
            document.getElementById("action-title").value = action.title || "";
            document.getElementById("action-description").value = action.description || "";
            document.getElementById("action-image-alt").value = action.imageAlt || "";
        }

        actionFormContainer.classList.add("is-open");
        actionFormContainer.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const closeActionForm = () => {
        actionFormContainer.classList.remove("is-open");
        actionForm.reset();
        actionIdInput.value = "";
        actionFormTitle.textContent = "Nueva acción";
        actionSubmitBtn.textContent = "Guardar acción";
        actionImageInput.required = true;
        actionKeyNote.textContent = "";
        actionImpactInput.value = "residuos";
        updateActionImpactHint();
    };

    actionImpactInput.addEventListener("change", updateActionImpactHint);

    document.getElementById("open-create-action-btn").addEventListener("click", () => openActionForm());
    document.getElementById("cancel-action-btn").addEventListener("click", closeActionForm);

    const loadActionCatalog = async () => {
        try {
            const { data } = await api.request("/api/admin/action-catalog");
            const actions = Array.isArray(data?.data) ? data.data : [];
            const container = document.getElementById("actions-admin-container");
            container.replaceChildren();

            if (!data?.success) {
                showApiError("actions-feedback", data);
                return;
            }

            if (actions.length === 0) {
                container.appendChild(createEmptyState("Todavía no hay acciones cargadas."));
                return;
            }

            actions.forEach(action => {
                const deleteDisabled = action.submissionCount > 0;

                container.appendChild(createCard({
                    imageUrl: format.resolveAssetUrl(action.image, null),
                    title: action.title,
                    meta: `Clave: ${action.key} · ${action.pointsPerUnit} Eco-Points por ${domain.actions.formatUnitRate(action.unit || actionUnits[action.impactMetric] || "acción")} · Orden: ${action.order}`,
                    description: action.description,
                    badge: action.archived ? { className: "archived", text: "Archivada" } : null,
                    actions: [
                        {
                            label: "Editar",
                            className: "admin-btn-neutral",
                            onClick: () => openActionForm(action)
                        },
                        {
                            label: action.archived ? "Reactivar" : "Archivar",
                            className: "admin-btn-neutral",
                            onClick: () => archiveAction(action._id)
                        },
                        {
                            label: "Eliminar",
                            className: "admin-btn-delete",
                            onClick: () => deleteActionCatalog(action._id),
                            disabled: deleteDisabled,
                            title: deleteDisabled ? "Tiene envíos asociados. Archivala para ocultarla." : ""
                        }
                    ]
                }));
            });
        } catch (err) {
            console.error("Error cargando acciones:", err);
            showApiError("actions-feedback", { message: "No se pudieron cargar las acciones." });
        }
    };

    const archiveAction = async (id) => {
        try {
            const { data } = await api.request(`/api/admin/action-catalog/${id}/archive`, { method: "PUT" });
            if (data?.success) {
                showMessage("actions-feedback", data?.message || "Acción actualizada.", "success");
                loadActionCatalog();
            } else {
                showApiError("actions-feedback", data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const deleteActionCatalog = async (id) => {
        if (!confirm("¿Estás seguro de eliminar esta acción?")) return;
        try {
            const { data } = await api.request(`/api/admin/action-catalog/${id}`, { method: "DELETE" });
            if (data?.success) {
                showMessage("actions-feedback", data?.message || "Acción eliminada.", "success");
                loadActionCatalog();
            } else {
                showApiError("actions-feedback", data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    actionForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const id = actionIdInput.value;
        const formData = new FormData();
        formData.append("title", document.getElementById("action-title").value.trim());
        formData.append("description", document.getElementById("action-description").value.trim());
        formData.append("pointsPerUnit", Number(document.getElementById("action-points").value));
        formData.append("impactMetric", actionImpactInput.value);
        formData.append("order", Number(document.getElementById("action-order").value));
        formData.append("imageAlt", document.getElementById("action-image-alt").value.trim());

        if (actionImageInput.files[0]) {
            formData.append("image", actionImageInput.files[0]);
        }

        const url = id ? `/api/admin/action-catalog/${id}` : "/api/admin/action-catalog";
        const method = id ? "PUT" : "POST";

        try {
            const { data } = await api.request(url, { method, body: formData });
            if (data?.success) {
                showMessage("actions-feedback", data?.message || (id ? "Acción actualizada con éxito." : "Acción creada con éxito."), "success");
                closeActionForm();
                loadActionCatalog();
            } else {
                showApiError("action-form-feedback", data);
            }
        } catch (err) {
            console.error(err);
        }
    });

    const loadPendingSubmissions = async () => {
        try {
            const { data } = await api.request("/api/admin/actions/pending");
            const actions = Array.isArray(data?.data) ? data.data : [];
            const container = document.getElementById("pending-actions-container");
            container.replaceChildren();

            if (!data?.success) {
                showApiError("action-feedback", data);
                return;
            }

            if (actions.length === 0) {
                container.appendChild(createEmptyState("No hay evidencias de acciones pendientes."));
                return;
            }

            actions.forEach(action => {
                const userName = action.user ? `${action.user.name} ${action.user.lastName}` : "Desconocido";
                const item = createCard({
                    title: `Usuario: ${userName}`,
                    meta: `Acción: ${action.actionType} · ${action.quantity ?? 1} ${action.unit || "acciones"} · ${action.pointsValue} Eco-Points`,
                    description: `Descripción: ${action.description || "Sin descripción"}`,
                    badge: {
                        className: action.status,
                        text: domain.actions.getSubmissionStatusLabel(action.status)
                    },
                    actions: [
                        {
                            label: "Aprobar",
                            className: "admin-btn-approve",
                            onClick: () => updateActionStatus(action._id, "approved")
                        },
                        {
                            label: "Rechazar",
                            className: "admin-btn-reject",
                            onClick: () => {
                                if (!confirm("¿Rechazar esta evidencia?")) return;
                                updateActionStatus(action._id, "rejected");
                            }
                        },
                        {
                            label: "Eliminar",
                            className: "admin-btn-delete",
                            onClick: () => deleteSubmission(action._id)
                        }
                    ]
                });

                const evidenceUrl = format.resolveEvidenceUrl(action.evidenceUrl);
                if (evidenceUrl) {
                    const info = item.querySelector(".admin-card-text");
                    if (format.isImageUrl(evidenceUrl)) {
                        const evidenceImg = document.createElement("img");
                        evidenceImg.src = evidenceUrl;
                        evidenceImg.alt = "Evidencia de la acción";
                        evidenceImg.className = "admin-evidence-img";
                        info.appendChild(evidenceImg);
                    } else {
                        const evidenceLink = document.createElement("a");
                        evidenceLink.href = evidenceUrl;
                        evidenceLink.target = "_blank";
                        evidenceLink.rel = "noopener noreferrer";
                        evidenceLink.className = "admin-evidence-link";
                        evidenceLink.textContent = "Ver evidencia";
                        info.appendChild(evidenceLink);
                    }
                }

                container.appendChild(item);
            });
        } catch (err) {
            console.error("Error cargando evidencias:", err);
            showApiError("action-feedback", { message: "No se pudieron cargar las evidencias." });
        }
    };

    const updateActionStatus = async (id, status) => {
        try {
            const { data } = await api.request(`/api/admin/actions/${id}`, {
                method: "PUT",
                body: JSON.stringify({ status })
            });
            if (data?.success) {
                showMessage("action-feedback", data?.message || "Evidencia revisada.", "success");
                loadPendingSubmissions();
            } else {
                showApiError("action-feedback", data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const deleteSubmission = async (id) => {
        if (!confirm("¿Estás seguro de eliminar esta evidencia?")) return;
        try {
            const { data } = await api.request(`/api/admin/actions/${id}`, { method: "DELETE" });
            if (data?.success) {
                showMessage("action-feedback", data?.message || "Evidencia eliminada.", "success");
                loadPendingSubmissions();
            } else {
                showApiError("action-feedback", data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const loadPurchases = async () => {
        try {
            const { data } = await api.request("/api/admin/purchases");
            const users = Array.isArray(data?.data) ? data.data : [];
            const container = document.getElementById("purchases-container");
            container.replaceChildren();

            if (!data?.success) {
                showApiError("purchases-feedback", { message: data?.message || "No se pudo cargar el reporte de compras." });
                container.appendChild(createEmptyState("No se pudo cargar el reporte de compras."));
                return;
            }

            if (users.length === 0) {
                container.appendChild(createEmptyState("No hay compras registradas."));
                return;
            }

            const table = document.createElement("table");
            table.className = "admin-table";

            const thead = document.createElement("thead");
            const headRow = document.createElement("tr");
            ["Usuario", "Correo", "Eco-Points", "Cursos", "Compras"].forEach(label => {
                const th = document.createElement("th");
                th.textContent = label;
                headRow.appendChild(th);
            });
            thead.appendChild(headRow);

            const tbody = document.createElement("tbody");
            users.forEach(u => {
                const row = document.createElement("tr");

                const nameCell = document.createElement("td");
                nameCell.textContent = `${u.name} ${u.lastName}`;

                const emailCell = document.createElement("td");
                emailCell.textContent = u.email;

                const pointsCell = document.createElement("td");
                pointsCell.textContent = u.ecoPoints ?? 0;

                const coursesCell = document.createElement("td");
                coursesCell.textContent = (u.coursesOwned || []).map(course => course?.title).filter(Boolean).join(", ") || "—";

                const purchases = u.pointsPurchases || [];
                const spent = purchases.reduce((total, purchase) => total + (Number(purchase.pointsSpent) || 0), 0);
                const moneyLabel = Object.entries(domain.purchases.getMoneyTotalsByCurrency(purchases))
                    .map(([currency, amount]) => format.formatMoney(amount, currency))
                    .join(" + ");
                const purchasesCell = document.createElement("td");
                purchasesCell.textContent = purchases.length
                    ? `${purchases.length} compra(s) · ${spent} Eco-Points${moneyLabel ? ` · ${moneyLabel} simulados` : ""}`
                    : "—";

                row.append(nameCell, emailCell, pointsCell, coursesCell, purchasesCell);
                tbody.appendChild(row);
            });

            table.append(thead, tbody);
            container.appendChild(table);
        } catch (err) {
            console.error("Error cargando compras:", err);
            showApiError("purchases-feedback", { message: "No se pudieron cargar las compras." });
        }
    };

    loadAdminCourses();
    loadAdminFaqs();
    loadActionCatalog();
    loadPendingSubmissions();
    loadPurchases();
});
