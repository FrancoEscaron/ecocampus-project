document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.getElementById("navIcon");
  const mainNav = document.getElementById("mainNav");

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", () => {
      const open = mainNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
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
    formulario.addEventListener("submit", async (e) => {
      e.preventDefault();

      const datos = {
        nombre: document.getElementById("nombre").value.trim(),
        apellido: document.getElementById("apellido").value.trim(),
        correo: document.getElementById("correo").value.trim(),
        mensaje: document.getElementById("mensaje").value.trim()
      };

      try {
        const respuesta = await fetch("http://localhost:3000/api/contacto", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(datos)
        });

        const resultado = await respuesta.json();

        if (resultado.success) {
          formulario.reset();
        }
      } catch (error) {
        console.error("Error al enviar el formulario: ", error);
      }
    });
  }

  const authLink = document.getElementById("auth-link");
  const currentUser = JSON.parse(localStorage.getItem("userEcoCampus"));
  if (authLink && currentUser) {
    authLink.textContent = `Hola, ${currentUser.name}`;
    authLink.href = "#";
    authLink.addEventListener("click", (e) => {
      e.preventDefault();
      if (confirm("¿Deseas cerrar sesión?")) {
        localStorage.removeItem("userEcoCampus");
        window.location.reload();
      }
    });
  }

  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      try {
        const res = await fetch("http://localhost:3000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem("userEcoCampus", JSON.stringify(data.user));
          alert("¡Bienvenido " + data.user.name + "!");
          window.location.href = "/courses.html";
        } else {
          alert(data.message);
        }
      } catch (err) {
        console.error("Error en login:", err);
      }
    });
  }

  const courseCards = document.querySelectorAll(".course-card");
  courseCards.forEach(card => {
    card.style.cursor = "pointer";
    card.addEventListener("click", () => {
      const courseId = card.getAttribute("data-course-id");
      const title = card.querySelector(".course-name").textContent;
      const description = card.querySelector(".course-description").textContent;

      abrirModalCurso({ _id: courseId, title, description });
    });
  });

  function abrirModalCurso(course) {
    const user = JSON.parse(localStorage.getItem("userEcoCampus"));
    if (!user) {
      alert("Debes iniciar sesión para ver este curso.");
      window.location.href = "/account.html";
      return;
    }

    const overlay = document.createElement("div");
    overlay.className = "course-modal-overlay";

    const hasAccess = user.role === 'admin' || (user.coursesOwned && user.coursesOwned.includes(course._id));

    overlay.innerHTML = `
      <div class="course-modal-box">
          <button class="course-modal-close-btn">&times;</button>
          <h2 class="course-modal-title">${course.title}</h2>
          <p class="course-modal-text">${course.description}</p>
          <div class="modal-body-container">
            ${hasAccess ? `
              <p><strong>¡Tienes acceso autorizado!</strong></p>
              <div class="course-secret-content-box">Contenido exclusivo del curso desbloqueado: Módulos de estudio, videos y guías prácticas sustentables.</div>
            ` : `
              <p>Este curso requiere un aporte de acciones sustentables para su desbloqueo completo.</p>
              <button id="btn-pagar-acciones" class="submit-btn modal-action-btn">Pagar con acciones sustentables</button>
            `}
          </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector(".course-modal-close-btn").addEventListener("click", () => overlay.remove());
    overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });

    const btnPagar = overlay.querySelector("#btn-pagar-acciones");
    if (btnPagar) {
      btnPagar.addEventListener("click", async () => {
        try {
          const res = await fetch("http://localhost:3000/api/courses/buy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id, courseId: course._id })
          });
          const data = await res.json();
          if (data.success) {
            user.coursesOwned = data.coursesOwned;
            localStorage.setItem("userEcoCampus", JSON.stringify(user));
            alert("¡Pago exitoso con acciones sustentables! Contenido desbloqueado.");
            overlay.remove();
            abrirModalCurso(course);
          }
        } catch (err) {
          console.error("Error en pasarela de pago:", err);
        }
      });
    }
  }

  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const datosUsuario = {
        name: document.getElementById("name").value.trim(),
        lastName: document.getElementById("lastName").value.trim(),
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("password").value.trim()
      };

      try {
        const res = await fetch("http://localhost:3000/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(datosUsuario)
        });

        const data = await res.json();

        if (data.success) {
          alert("¡Registro exitoso! Ahora puedes iniciar sesión.");
          window.location.href = "/account.html";
        } else {
          alert(data.message || "Error al registrarse.");
        }
      } catch (err) {
        console.error("Error en registro:", err);
      }
    });
  }
});




