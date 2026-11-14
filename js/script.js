document.addEventListener("DOMContentLoaded", () => {
  const { session, api, format, events, domain, a11y } = window.EcoCampus;
  const { escapeHtml, formatMoney, roundMoney, safeExternalUrl } = format;
  const { getCourseLevelLabel, getCoursePaymentType, getCoursePaymentLabel, getCourseCostLabel } = domain.courses;

  const setFeedback = (element, message, type = "success") => {
    if (!element) return;
    element.textContent = message;
    element.classList.remove("success", "error");
    element.classList.add(type);
    element.hidden = false;
  };

  const navToggle = document.getElementById("navIcon");
  const mainNav = document.getElementById("mainNav");

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", () => {
      const open = mainNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    });

    mainNav.querySelectorAll("a").forEach((enlace) => {
      enlace.addEventListener("click", () => {
        mainNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  const formulario = document.getElementById("full-form");

  if (formulario) {
    const feedback = document.getElementById("contact-feedback");
    const submitButton = formulario.querySelector('button[type="submit"]');

    formulario.addEventListener("submit", async (e) => {
      e.preventDefault();

      const datos = {
        nombre: document.getElementById("nombre").value.trim(),
        apellido: document.getElementById("apellido").value.trim(),
        correo: document.getElementById("correo").value.trim(),
        mensaje: document.getElementById("mensaje").value.trim()
      };

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Enviando...";
      }

      try {
        const { data: resultado } = await api.request("/api/contacto", {
          method: "POST",
          body: JSON.stringify(datos),
          auth: false,
          redirectOnUnauthorized: false
        });

        if (resultado?.success) {
          formulario.reset();
          setFeedback(feedback, resultado.message || "Mensaje enviado. Te responderemos pronto.", "success");
        } else {
          setFeedback(feedback, resultado?.message || "No se pudo enviar el mensaje.", "error");
        }
      } catch (error) {
        console.error("Error al enviar el formulario: ", error);
        setFeedback(feedback, "No se pudo enviar el mensaje. Intentá nuevamente.", "error");
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = "Enviar mensaje";
        }
      }
    });
  }

  const authLink = document.getElementById("auth-link");
  const currentUser = session.getUser();
  if (authLink && currentUser) {
    authLink.textContent = `Hola, ${currentUser.name}`;
    authLink.href = "#";
    authLink.addEventListener("click", (e) => {
      e.preventDefault();
      if (confirm("¿Deseas cerrar sesión?")) {
        session.clearSession();
        window.location.reload();
      }
    });
  }
  const adminSlot = document.getElementById("admin-menu-slot");
  if (adminSlot && currentUser) {
    const createMenuLink = (href, text, color = "") => {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = href;
      link.textContent = text;
      if (color) link.style.color = color;
      item.appendChild(link);
      return item;
    };

    const menuItems = [createMenuLink("/dashboard.html", "Mi panel")];

    if (currentUser.role === "admin") {
      menuItems.push(createMenuLink("/admin.html", "Panel Admin", "var(--color-strong-name)"));
    }

    adminSlot.replaceWith(...menuItems);
  }

  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    const feedback = document.getElementById("login-feedback");
    const submitButton = loginForm.querySelector('button[type="submit"]');

    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Ingresando...";
      }

      try {
        const { data } = await api.request("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
          auth: false,
          redirectOnUnauthorized: false
        });
        const payload = data?.data || {};
        if (data?.success && payload.token) {
          session.setSession({ token: payload.token, user: payload.user });
          setFeedback(feedback, `¡Bienvenido ${payload.user.name}!`, "success");
          window.setTimeout(() => {
            window.location.href = "/courses.html";
          }, 800);
        } else {
          setFeedback(feedback, data?.message || "No se pudo iniciar sesión.", "error");
        }
      } catch (err) {
        console.error("Error en login:", err);
        setFeedback(feedback, "No se pudo iniciar sesión. Intentá nuevamente.", "error");
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = "Ingresar";
        }
      }
    });
  }

  function abrirModalCurso(course) {
    const user = session.getUser();
    if (!user) {
      alert("Debes iniciar sesión para ver este curso.");
      window.location.href = "/account.html";
      return;
    }

    const overlay = document.createElement("div");
    overlay.className = "course-modal-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "course-modal-title");

    const hasAccess = user.role === 'admin' || (Array.isArray(user.coursesOwned) && user.coursesOwned.includes(course._id));
    const pointsCost = Math.max(0, Math.floor(Number(course.pointsCost) || 0));
    const price = Math.max(0, Number(course.price) || 0);
    const currency = course.currency || "UYU";
    const availablePoints = Math.max(0, Math.floor(Number(user.ecoPoints) || 0));
    const isMixed = pointsCost > 0 && price > 0;
    const isPointsOnly = pointsCost > 0 && price === 0;
    const isMoneyOnly = pointsCost === 0 && price > 0;
    const isFree = pointsCost === 0 && price === 0;
    const hasEnoughPoints = availablePoints >= pointsCost;
    const maxPoints = Math.min(pointsCost, availablePoints);
    const duration = course.duration ? `Duración: ${escapeHtml(course.duration)}` : "";
    const modules = Number.isFinite(Number(course.modulesCount)) ? `${Number(course.modulesCount)} módulos` : "";
    const meta = [duration, modules].filter(Boolean).join(" · ");
    const content = course.contentDetails
      ? escapeHtml(course.contentDetails)
      : "Contenido exclusivo del curso desbloqueado.";
    const videoUrl = safeExternalUrl(course.videoUrl);
    const pdfUrl = safeExternalUrl(course.pdfUrl);
    const resources = [];
    const costText = getCourseCostLabel(course);

    if (videoUrl) {
      resources.push(`<a href="${escapeHtml(videoUrl)}" target="_blank" rel="noopener noreferrer">Ver video</a>`);
    }

    if (pdfUrl) {
      resources.push(`<a href="${escapeHtml(pdfUrl)}" target="_blank" rel="noopener noreferrer">Descargar PDF</a>`);
    }

    const levelLabel = getCourseLevelLabel(course.level);
    const paymentType = getCoursePaymentType(course);
    const paymentLabel = getCoursePaymentLabel(paymentType);
    const badges = `
      <div class="course-modal-badges">
        <span class="course-badge course-badge-level">${escapeHtml(levelLabel)}</span>
        <span class="course-badge course-badge-payment ${paymentType}">${escapeHtml(paymentLabel)}</span>
      </div>
    `;

    const calcMoney = (points) => pointsCost > 0
      ? roundMoney(price * (1 - points / pointsCost))
      : roundMoney(price);

    let paymentMarkup = "";

    if (isFree) {
      paymentMarkup = `
        <p>Este curso es gratuito. Desbloquealo para acceder al contenido completo.</p>
        <button id="btn-pagar-acciones" class="submit-btn modal-action-btn" type="button">Desbloquear curso</button>
      `;
    } else if (isMixed) {
      const defaultPoints = maxPoints;
      const defaultMoney = calcMoney(defaultPoints);
      paymentMarkup = `
        <p>Elegí cuántos Eco-Points querés usar. El resto se completa con dinero simulado.</p>
        <div class="course-payment-simulator">
          <div class="course-payment-balance">
            <span>Saldo disponible</span>
            <strong>${availablePoints} Eco-Points</strong>
          </div>
          ${maxPoints > 0 ? `
            <label class="course-payment-label" for="course-points-range">Eco-Points a usar</label>
            <input class="course-payment-range" id="course-points-range" type="range" min="0" max="${maxPoints}" step="1" value="${defaultPoints}" aria-describedby="course-payment-summary">
          ` : `
            <p class="course-payment-warning">No tenés Eco-Points disponibles. Vas a pagar el total con dinero simulado.</p>
          `}
          <div class="course-payment-breakdown" id="course-payment-summary" aria-live="polite">
            <p><span>Eco-Points:</span> <strong id="course-points-used">${defaultPoints}</strong></p>
            <p><span>Dinero simulado:</span> <strong id="course-money-used">${formatMoney(defaultMoney, currency)}</strong></p>
          </div>
          <p class="course-payment-note">Pago simulado: no se realiza ningún cobro real.</p>
        </div>
        <button id="btn-pagar-acciones" class="submit-btn modal-action-btn" type="button">Confirmar pago simulado</button>
      `;
    } else if (isMoneyOnly) {
      paymentMarkup = `
        <p>Este curso se paga únicamente con dinero.</p>
        <div class="course-payment-simulator">
          <div class="course-payment-breakdown">
            <p><span>Dinero a pagar:</span> <strong>${formatMoney(price, currency)}</strong></p>
          </div>
          <p class="course-payment-note">Pago simulado: no se realiza ningún cobro real.</p>
        </div>
        <button id="btn-pagar-acciones" class="submit-btn modal-action-btn" type="button">Pagar ${formatMoney(price, currency)} (simulado)</button>
      `;
    } else if (isPointsOnly) {
      paymentMarkup = `
        <p>Este curso se desbloquea con Eco-Points.</p>
        <div class="course-payment-simulator">
          <div class="course-payment-breakdown">
            <p><span>Costo:</span> <strong>${pointsCost} Eco-Points</strong></p>
            <p><span>Tu saldo:</span> <strong>${availablePoints} Eco-Points</strong></p>
          </div>
          ${hasEnoughPoints ? "" : `
            <p class="course-payment-warning">No tenés Eco-Points suficientes. Completá más acciones sustentables para desbloquearlo.</p>
          `}
        </div>
        <button id="btn-pagar-acciones" class="submit-btn modal-action-btn" type="button" ${hasEnoughPoints ? "" : "disabled"}>${hasEnoughPoints ? "Pagar con acciones sustentables" : "Eco-Points insuficientes"}</button>
      `;
    }

    overlay.innerHTML = `
      <div class="course-modal-box">
          <button class="course-modal-close-btn" type="button" aria-label="Cerrar">&times;</button>
          <h2 class="course-modal-title" id="course-modal-title">${escapeHtml(course.title)}</h2>
          ${badges}
          <p class="course-modal-text">${escapeHtml(course.description)}</p>
          ${meta ? `<p class="course-modal-meta">${meta}</p>` : ""}
          <p class="course-modal-cost">Costo: ${costText}</p>
          <div class="modal-body-container">
            ${hasAccess ? `
              <p><strong>¡Tienes acceso autorizado!</strong></p>
              <div class="course-secret-content-box">${content}</div>
              ${resources.length ? `<div class="course-modal-resources">${resources.join("")}</div>` : ""}
            ` : paymentMarkup}
          </div>
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
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal();
    });

    const range = overlay.querySelector("#course-points-range");
    const pointsUsedLabel = overlay.querySelector("#course-points-used");
    const moneyUsedLabel = overlay.querySelector("#course-money-used");

    if (range && pointsUsedLabel && moneyUsedLabel) {
      const updateSummary = () => {
        const points = Number(range.value) || 0;
        const money = calcMoney(points);
        pointsUsedLabel.textContent = String(points);
        moneyUsedLabel.textContent = formatMoney(money, currency);
        range.setAttribute("aria-valuetext", `${points} Eco-Points y ${formatMoney(money, currency)} simulados`);
      };

      range.addEventListener("input", updateSummary);
      updateSummary();
    }

    const btnPagar = overlay.querySelector("#btn-pagar-acciones");
    if (btnPagar) {
      btnPagar.addEventListener("click", async () => {
        const pointsUsed = range
          ? Number(range.value) || 0
          : isPointsOnly
            ? pointsCost
            : 0;

        btnPagar.disabled = true;

        try {
          const { response, data } = await api.request("/api/courses/buy", {
            method: "POST",
            body: JSON.stringify({ courseId: course._id, pointsUsed }),
            redirectOnUnauthorized: false
          });

          if (response.status === 401) {
            session.clearSession();
            alert("Tu sesión venció. Iniciá sesión nuevamente.");
            window.location.href = "/account.html";
            return;
          }

          if (data?.success) {
            const payload = data.data || {};
            session.updateUser({
              coursesOwned: payload.coursesOwned,
              ecoPoints: payload.ecoPoints
            });
            events.emit(events.EVENTS.coursesUpdated);
            alert(data.message || "Curso desbloqueado con éxito.");
            closeModal();
            abrirModalCurso(course);
          } else {
            alert(data?.message || "No se pudo completar el pago.");
            btnPagar.disabled = false;
          }
        } catch (err) {
          console.error("Error en pasarela de pago:", err);
          btnPagar.disabled = false;
        }
      });
    }
  }

  window.abrirModalCurso = abrirModalCurso;

  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    const feedback = document.getElementById("register-feedback");
    const submitButton = registerForm.querySelector('button[type="submit"]');

    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const datosUsuario = {
        name: document.getElementById("name").value.trim(),
        lastName: document.getElementById("lastName").value.trim(),
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("password").value.trim()
      };

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Registrando...";
      }

      try {
        const { data } = await api.request("/api/auth/register", {
          method: "POST",
          body: JSON.stringify(datosUsuario),
          auth: false,
          redirectOnUnauthorized: false
        });

        if (data?.success) {
          setFeedback(feedback, "¡Registro exitoso! Ahora podés iniciar sesión.", "success");
          window.setTimeout(() => {
            window.location.href = "/account.html";
          }, 900);
        } else {
          setFeedback(feedback, data?.message || "No se pudo completar el registro.", "error");
        }
      } catch (err) {
        console.error("Error en registro:", err);
        setFeedback(feedback, "No se pudo completar el registro. Intentá nuevamente.", "error");
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = "Registrarse";
        }
      }
    });
  }
});




