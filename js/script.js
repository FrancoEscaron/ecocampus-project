/* const {suma, resta, multiplicacion, division} = require("./calculator"); */

document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.getElementById("navIcon");
  const mainNav = document.getElementById("mainNav");

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
});




