export const SUBMISSION_STATUS_LABELS = {
    pending: "Pendiente",
    approved: "Aprobada",
    rejected: "Rechazada"
};

export const ACTION_IMPACT_UNITS = {
    residuos: "kg",
    arboles: "árboles",
    horas: "horas",
    energia: "kWh",
    electronicos: "unidades",
    acciones: "acciones"
};

export const UNIT_RATE_LABELS = {
    "árboles": "árbol",
    "unidades": "unidad",
    "acciones": "acción",
    "horas": "hora"
};

export const WHOLE_UNITS = ["árboles", "unidades", "acciones"];

export const getSubmissionStatusLabel = (status) => SUBMISSION_STATUS_LABELS[status] || status;

export const formatUnitRate = (unit) => UNIT_RATE_LABELS[unit] || unit;

export const isWholeUnit = (unit) => WHOLE_UNITS.includes(unit);

export const getQuantityStep = (unit) => isWholeUnit(unit) ? "1" : "0.01";

export const getQuantityMin = (unit) => isWholeUnit(unit) ? "1" : "0.01";

export const calculateEstimatedPoints = (pointsPerUnit, quantity) => {
    const points = Number(pointsPerUnit) || 0;
    const amount = Number(quantity);
    return Number.isFinite(amount) && amount > 0 ? Math.round(points * amount) : 0;
};
