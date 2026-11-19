export const SUBMISSION_STATUS_LABELS = {
  pending: "Pendiente",
  approved: "Aprobada",
  rejected: "Rechazada",
};

export const UNIT_RATE_LABELS = {
  árboles: "árbol",
  unidades: "unidad",
  acciones: "acción",
  horas: "hora",
};

export const ACTION_IMPACT_UNITS = {
  residuos: "kg",
  arboles: "árboles",
  horas: "horas",
  energia: "kWh",
  electronicos: "unidades",
  acciones: "acciones",
};

export const WHOLE_UNITS = ["árboles", "unidades", "acciones"];

export const getActionUnit = (impactMetric) => ACTION_IMPACT_UNITS[impactMetric] || "acciones";

export const getSubmissionStatusLabel = (status) =>
  SUBMISSION_STATUS_LABELS[status] || status;

export const formatUnitRate = (unit) => UNIT_RATE_LABELS[unit] || unit;

export const isWholeUnit = (unit) => WHOLE_UNITS.includes(unit);

export const getQuantityStep = (unit) => (isWholeUnit(unit) ? "1" : "0.01");

export const getQuantityMin = (unit) => (isWholeUnit(unit) ? "1" : "0.01");

export const DEFAULT_COOLDOWN_DAYS = 30;

export const getCooldownDays = (accion) => {
  const value = Number(accion?.cooldownDays);
  if (!Number.isFinite(value) || value < 0) return DEFAULT_COOLDOWN_DAYS;
  return Math.floor(value);
};

export const getCooldownLabel = (days) => {
  const total = Math.max(0, Math.floor(Number(days) || 0));
  return `${total} ${total === 1 ? "día" : "días"}`;
};

const getSubmissionDate = (envio) => {
  const valor = envio?.reviewedAt || envio?.submittedAt;
  const fecha = new Date(valor);
  return Number.isFinite(fecha.getTime()) ? fecha : null;
};

export const getCooldownEnd = (accion, ultimoAprobado) => {
  const days = getCooldownDays(accion);

  if (!ultimoAprobado || days <= 0) return null;

  const base = getSubmissionDate(ultimoAprobado);
  if (!base) return null;

  return new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
};

export const formatWait = (fecha, ahora = Date.now()) => {
  const restante = new Date(fecha).getTime() - ahora;
  if (!Number.isFinite(restante) || restante <= 0) return "";

  const minutos = Math.ceil(restante / 60000);
  if (minutos < 60) return `${minutos} ${minutos === 1 ? "minuto" : "minutos"}`;

  const horas = Math.ceil(restante / 3600000);
  if (horas < 48) return `${horas} ${horas === 1 ? "hora" : "horas"}`;

  const dias = Math.ceil(restante / 86400000);
  return `${dias} ${dias === 1 ? "día" : "días"}`;
};

export const calculateEstimatedPoints = (pointsPerUnit, quantity) => {
  const points = Number(pointsPerUnit) || 0;
  const amount = Number(quantity);
  return Number.isFinite(amount) && amount > 0 ? Math.round(points * amount) : 0;
};
