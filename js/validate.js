document.addEventListener("DOMContentLoaded", () => {
  const { session, api, format, domain, a11y } = window.EcoCampus;
  const cardsGrid = document.getElementById("actions-grid") || document.querySelector(".cards-val-grid");
  const submissionsContainer = document.getElementById("my-submissions-container");

  if (!cardsGrid || !submissionsContainer) return;

  let latestSubmissions = [];
  const actionsByKey = new Map();
  const token = session.getToken();
  const currentUser = session.getUser();
  const isLoggedIn = Boolean(token && currentUser);

  const redirectToLogin = (message) => {
    session.clearSession();
    alert(message);
    window.location.href = "/account.html";
  };

  const showMessage = (container, message, type) => {
    container.replaceChildren();
    const box = document.createElement("div");
    box.className = `action-msg ${type}`;
    box.textContent = message;
    container.appendChild(box);
  };

  const createActionCard = (action) => {
    const article = document.createElement("article");
    article.className = "validate-card";

    const media = document.createElement("div");
    media.className = "validate-media";

    const image = document.createElement("img");
    image.src = format.resolveAssetUrl(action.image);
    image.alt = action.imageAlt || action.title || "Acción sustentable";
    image.loading = "lazy";
    image.addEventListener("error", () => {
      image.src = format.DEFAULT_COURSE_IMAGE;
    }, { once: true });

    const tag = document.createElement("span");
    tag.className = "validate-tag";
    tag.textContent = `${action.pointsPerUnit} Eco-Points por ${domain.actions.formatUnitRate(action.unit || "acción")}`;

    media.append(image, tag);

    const body = document.createElement("div");
    body.className = "validate-body";

    const title = document.createElement("h2");
    title.className = "validate-name";
    title.textContent = action.title;

    const description = document.createElement("p");
    description.className = "validate-desc";
    description.textContent = action.description;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "validate-submit-btn";
    button.dataset.actionKey = action.key;
    button.textContent = "Subir evidencia";

    body.append(title, description, button);
    article.append(media, body);
    return article;
  };

  const resetButtonState = (button) => {
    button.textContent = "Subir evidencia";
    button.disabled = false;
  };

  const setButtonState = (button, status) => {
    if (status === "pending") {
      button.textContent = "Pendiente de revisión";
      button.disabled = true;
      return;
    }

    if (status === "approved") {
      button.textContent = "Acción validada";
      button.disabled = true;
      return;
    }

    button.textContent = "Volver a enviar";
    button.disabled = false;
  };

  const updateCardButtons = (submissions) => {
    const latestByAction = new Map();

    submissions.forEach((submission) => {
      if (!submission.actionKey) return;
      const previous = latestByAction.get(submission.actionKey);
      if (!previous || new Date(submission.submittedAt) > new Date(previous.submittedAt)) {
        latestByAction.set(submission.actionKey, submission);
      }
    });

    document.querySelectorAll(".validate-submit-btn").forEach((button) => {
      resetButtonState(button);
      const latest = latestByAction.get(button.dataset.actionKey);
      if (latest) setButtonState(button, latest.status);
    });
  };

  const createSubmissionItem = (submission) => {
    const item = document.createElement("article");
    item.className = "submission-item";

    const info = document.createElement("div");
    info.className = "submission-info";

    const title = document.createElement("h3");
    title.textContent = submission.actionType;

    const meta = document.createElement("p");
    const quantity = Number(submission.quantity);
    const quantityText = quantity > 0 ? `${quantity} ${submission.unit || "acciones"} · ` : "";
    meta.textContent = `${quantityText}${submission.pointsValue} Eco-Points · ${format.formatDate(submission.submittedAt)}`;

    const status = document.createElement("span");
    status.className = `submission-status ${submission.status}`;
    status.textContent = domain.actions.getSubmissionStatusLabel(submission.status);

    info.append(title, meta, status);

    const evidenceUrl = format.resolveEvidenceUrl(submission.evidenceUrl);
    let evidence;

    if (evidenceUrl) {
      evidence = document.createElement("a");
      evidence.className = "submission-evidence-link";
      evidence.href = evidenceUrl;
      evidence.target = "_blank";
      evidence.rel = "noopener noreferrer";
      evidence.textContent = "Ver evidencia";
    } else {
      evidence = document.createElement("span");
      evidence.className = "submission-evidence-missing";
      evidence.textContent = "Evidencia no disponible";
    }

    item.append(info, evidence);
    return item;
  };

  const renderSubmissions = (submissions) => {
    latestSubmissions = submissions;
    submissionsContainer.replaceChildren();
    updateCardButtons(submissions);

    if (submissions.length === 0) {
      const empty = document.createElement("p");
      empty.className = "my-submissions-empty";
      empty.textContent = "Todavía no enviaste evidencias.";
      submissionsContainer.appendChild(empty);
      return;
    }

    submissions.forEach((submission) => {
      submissionsContainer.appendChild(createSubmissionItem(submission));
    });
  };

  const loadCatalog = async () => {
    try {
      const payload = await api.get("/api/actions/catalog", { auth: false });
      const actions = Array.isArray(payload.data) ? payload.data : [];

      actionsByKey.clear();

      if (actions.length === 0) {
        cardsGrid.replaceChildren();
        const empty = document.createElement("p");
        empty.className = "public-empty";
        empty.textContent = "Todavía no hay acciones disponibles.";
        cardsGrid.appendChild(empty);
        return;
      }

      actions.forEach((action) => {
        actionsByKey.set(action.key, action);
      });

      cardsGrid.replaceChildren();
      actions.forEach((action) => {
        cardsGrid.appendChild(createActionCard(action));
      });
      updateCardButtons(latestSubmissions);
    } catch (error) {
      console.error("Error al cargar las acciones:", error);
      actionsByKey.clear();
      cardsGrid.replaceChildren();
      const empty = document.createElement("p");
      empty.className = "public-empty";
      empty.textContent = "No se pudieron cargar las acciones. Intentá nuevamente más tarde.";
      cardsGrid.appendChild(empty);
    }
  };

  const loadSubmissions = async () => {
    if (!isLoggedIn) {
      submissionsContainer.replaceChildren();
      const empty = document.createElement("p");
      empty.className = "my-submissions-empty";
      empty.textContent = "Iniciá sesión para ver tus envíos.";
      submissionsContainer.appendChild(empty);
      return;
    }

    try {
      const { response, data: payload } = await api.request("/api/actions/mine", {
        redirectOnUnauthorized: false
      });

      if (response.status === 401) {
        redirectToLogin("Tu sesión venció. Iniciá sesión nuevamente.");
        return;
      }

      const submissions = Array.isArray(payload?.data) ? payload.data : [];
      renderSubmissions(submissions);
    } catch (error) {
      console.error("Error al cargar los envíos:", error);
      submissionsContainer.replaceChildren();
      const empty = document.createElement("p");
      empty.className = "my-submissions-empty";
      empty.textContent = "No se pudieron cargar tus envíos.";
      submissionsContainer.appendChild(empty);
    }
  };

  const openEvidenceModal = (button) => {
    const actionKey = button.dataset.actionKey;
    const action = actionsByKey.get(actionKey);

    if (!action) return;

    const unit = action.unit || "acción";
    const pointsPerUnit = Number(action.pointsPerUnit) || 0;
    const wholeUnit = domain.actions.isWholeUnit(unit);
    const quantityStep = domain.actions.getQuantityStep(unit);
    const quantityMin = domain.actions.getQuantityMin(unit);

    const overlay = document.createElement("div");
    overlay.className = "course-modal-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "evidence-modal-title");
    overlay.innerHTML = `
      <div class="course-modal-box">
        <button class="course-modal-close-btn" type="button" aria-label="Cerrar">&times;</button>
        <h2 class="course-modal-title" id="evidence-modal-title">Subir evidencia</h2>
        <p class="course-modal-text">${format.escapeHtml(action.title)} · ${pointsPerUnit} Eco-Points por ${format.escapeHtml(domain.actions.formatUnitRate(unit))}</p>
        <form class="form" id="evidence-form">
          <div class="form-group">
            <label for="evidence-description">Contanos qué hiciste</label>
            <textarea id="evidence-description" rows="4" minlength="10" maxlength="1000" required placeholder="Describí brevemente la acción realizada."></textarea>
          </div>
          <div class="form-group">
            <label for="evidence-quantity">Cantidad (${format.escapeHtml(unit)})</label>
            <input type="number" id="evidence-quantity" min="${quantityMin}" step="${quantityStep}" value="1" required>
          </div>
          <p class="evidence-points-preview" id="evidence-points-preview" aria-live="polite">Puntos estimados: ${pointsPerUnit} Eco-Points</p>
          <div class="form-group">
            <label for="evidence-file">Foto o PDF de la evidencia</label>
            <input type="file" id="evidence-file" accept="image/jpeg,image/png,image/webp,application/pdf" required>
          </div>
          <div id="evidence-feedback"></div>
          <div class="action-modal-actions">
            <button type="submit" class="submit-btn">Enviar evidencia</button>
            <button type="button" class="action-modal-cancel">Cancelar</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);

    let trap = null;
    const closeModal = () => {
      if (trap) trap.release();
      overlay.remove();
    };

    trap = a11y.trapFocus(overlay, {
      onEscape: closeModal,
      initialFocus: overlay.querySelector(".course-modal-close-btn")
    });

    overlay.querySelector(".course-modal-close-btn").addEventListener("click", closeModal);
    overlay.querySelector(".action-modal-cancel").addEventListener("click", closeModal);
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) closeModal();
    });

    const form = overlay.querySelector("#evidence-form");
    const feedback = overlay.querySelector("#evidence-feedback");
    const quantityInput = overlay.querySelector("#evidence-quantity");
    const pointsPreview = overlay.querySelector("#evidence-points-preview");
    const submitButton = form.querySelector('button[type="submit"]');

    const updatePointsPreview = () => {
      const points = domain.actions.calculateEstimatedPoints(pointsPerUnit, quantityInput.value);
      pointsPreview.textContent = `Puntos estimados: ${points} Eco-Points`;
    };

    quantityInput.addEventListener("input", updatePointsPreview);
    updatePointsPreview();

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const description = overlay.querySelector("#evidence-description").value.trim();
      const quantity = Number(quantityInput.value);
      const file = overlay.querySelector("#evidence-file").files[0];
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

      if (description.length < 10 || description.length > 1000) {
        showMessage(feedback, "La descripción debe tener entre 10 y 1000 caracteres.", "error");
        return;
      }

      if (!Number.isFinite(quantity) || quantity <= 0 || quantity > 100000) {
        showMessage(feedback, "La cantidad debe ser mayor a 0 y menor o igual a 100000.", "error");
        return;
      }

      if (wholeUnit && !Number.isInteger(quantity)) {
        showMessage(feedback, `La cantidad de ${unit} debe ser un número entero.`, "error");
        return;
      }

      if (!file) {
        showMessage(feedback, "Seleccioná una foto o un PDF como evidencia.", "error");
        return;
      }

      if (!allowedTypes.includes(file.type)) {
        showMessage(feedback, "Formato no permitido. Subí una imagen JPG, PNG o WebP o un PDF.", "error");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showMessage(feedback, "El archivo supera el límite de 5 MB.", "error");
        return;
      }

      const formData = new FormData();
      formData.append("actionKey", actionKey);
      formData.append("description", description);
      formData.append("quantity", quantity);
      formData.append("evidence", file);

      submitButton.disabled = true;
      submitButton.textContent = "Enviando...";

      try {
        const { response, data: payload } = await api.request("/api/actions", {
          method: "POST",
          body: formData,
          redirectOnUnauthorized: false
        });

        if (response.status === 401) {
          redirectToLogin("Tu sesión venció. Iniciá sesión nuevamente.");
          return;
        }

        if (payload?.success) {
          showMessage(feedback, payload.message, "success");
          await loadSubmissions();
          setTimeout(closeModal, 1500);
        } else {
          showMessage(feedback, payload?.message || "No se pudo enviar la evidencia.", "error");
          if (response.status === 409) await loadSubmissions();
        }
      } catch (error) {
        console.error("Error al enviar la evidencia:", error);
        showMessage(feedback, "No se pudo enviar la evidencia. Intentá nuevamente.", "error");
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Enviar evidencia";
      }
    });
  };

  cardsGrid.addEventListener("click", (event) => {
    const button = event.target.closest(".validate-submit-btn");
    if (!button || button.disabled) return;

    if (!isLoggedIn) {
      alert("Iniciá sesión para enviar evidencias.");
      window.location.href = "/account.html";
      return;
    }

    openEvidenceModal(button);
  });

  loadCatalog();
  loadSubmissions();
});
