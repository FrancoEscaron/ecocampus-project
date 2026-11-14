document.addEventListener("DOMContentLoaded", () => {
  const { api, format } = window.EcoCampus;
  const impactGrid = document.getElementById("impact-grid");
  const impactEmpty = document.getElementById("impact-empty");

  if (!impactGrid) return;

  const setFinalValue = (counter) => {
    const target = Number(counter.dataset.target) || 0;
    counter.textContent = format.formatNumber(target, Number.isInteger(target) ? 0 : 1);
    counter.dataset.animated = "true";
  };

  const animateCounter = (counter) => {
    if (counter.dataset.animated === "true") return;

    const target = Number(counter.dataset.target) || 0;
    const decimals = Number.isInteger(target) ? 0 : 1;

    if (target === 0) {
      setFinalValue(counter);
      return;
    }

    const duration = 900;
    const start = performance.now();

    const tick = (now) => {
      if (counter.dataset.animated === "true") return;

      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      counter.textContent = format.formatNumber(target * eased, decimals);

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        setFinalValue(counter);
      }
    };

    requestAnimationFrame(tick);
  };

  const observeCounters = () => {
    const counters = impactGrid.querySelectorAll(".counter");

    if (!("IntersectionObserver" in window)) {
      counters.forEach(animateCounter);
      return;
    }

    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.3 });

    counters.forEach((counter) => observer.observe(counter));

    setTimeout(() => {
      counters.forEach((counter) => {
        if (counter.dataset.animated !== "true") setFinalValue(counter);
      });
    }, 1200);
  };

  const createImpactCard = ({ icon, label, unit, value }) => {
    const card = document.createElement("article");
    card.className = "impact-card";

    const iconElement = document.createElement("div");
    iconElement.className = "impact-icon";
    iconElement.textContent = icon || "🌱";

    const numberWrapper = document.createElement("div");
    numberWrapper.className = "impact-number-wrapper";

    const counter = document.createElement("span");
    counter.className = "counter";
    counter.dataset.target = String(Number(value) || 0);
    counter.textContent = "0";
    numberWrapper.appendChild(counter);

    if (unit) {
      const unitElement = document.createElement("span");
      unitElement.className = "unit";
      unitElement.textContent = unit;
      numberWrapper.appendChild(unitElement);
    }

    const labelElement = document.createElement("p");
    labelElement.textContent = label;

    card.append(iconElement, numberWrapper, labelElement);
    return card;
  };

  const renderImpact = (data) => {
    const metrics = Array.isArray(data.metrics) ? data.metrics : [];
    const totals = data.totals || {};
    const cards = [
      ...metrics,
      {
        icon: "✅",
        label: "Acciones aprobadas",
        unit: "",
        value: totals.approvedActions || 0
      },
      {
        icon: "🌱",
        label: "Eco-Points otorgados",
        unit: "",
        value: totals.pointsAwarded || 0
      }
    ];

    impactGrid.replaceChildren();
    cards.forEach((metric) => {
      impactGrid.appendChild(createImpactCard(metric));
    });

    if (impactEmpty) {
      impactEmpty.hidden = Number(totals.approvedActions) > 0;
    }

    observeCounters();
  };

  const loadImpact = async () => {
    try {
      const payload = await api.get("/api/impact", { auth: false });
      renderImpact(payload.data || {});
    } catch (error) {
      console.error("Error al cargar el impacto:", error);
      impactGrid.replaceChildren();
      const message = document.createElement("p");
      message.className = "impact-empty";
      message.textContent = "No se pudo cargar el impacto. Intentá nuevamente más tarde.";
      impactGrid.appendChild(message);
    }
  };

  loadImpact();
});
