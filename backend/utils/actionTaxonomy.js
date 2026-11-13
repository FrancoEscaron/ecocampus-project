const IMPACT_METRICS = Object.freeze({
    residuos: { label: "Kg recuperados", unit: "kg", icon: "♻️" },
    arboles: { label: "Árboles plantados", unit: "árboles", icon: "🌳" },
    horas: { label: "Horas de voluntariado", unit: "horas", icon: "🤝" },
    energia: { label: "Energía ahorrada", unit: "kWh", icon: "⚡" },
    electronicos: { label: "Electrónicos reutilizados", unit: "unidades", icon: "🔌" },
    acciones: { label: "Acciones generales", unit: "acciones", icon: "✅" }
});

const IMPACT_METRIC_KEYS = Object.keys(IMPACT_METRICS);

module.exports = { IMPACT_METRICS, IMPACT_METRIC_KEYS };
