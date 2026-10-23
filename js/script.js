/* const {suma, resta, multiplicacion, division} = require("./calculator"); */

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

