import { formatMoney } from "./format";

export const getPurchaseParts = (compra = {}) => {
  const pointsSpent = Number(compra.pointsSpent) || 0;
  const moneySpent = Number(compra.moneySpent) || 0;
  const currency = compra.currency || compra.course?.currency || "UYU";
  const parts = [];

  if (pointsSpent > 0) parts.push(`${pointsSpent} Eco-Points`);
  if (moneySpent > 0) parts.push(`${formatMoney(moneySpent, currency)} simulados`);

  return { pointsSpent, moneySpent, currency, parts };
};

export const getPurchaseSummary = (compra = {}) => {
  const { parts } = getPurchaseParts(compra);
  return parts.length ? parts.join(" + ") : "Sin costo";
};

export const getMoneyTotalsByCurrency = (compras = []) =>
  compras.reduce((acumulador, compra) => {
    const currency = compra.currency || "UYU";
    const amount = Number(compra.moneySpent) || 0;
    if (amount > 0) {
      acumulador[currency] = Math.round(((acumulador[currency] || 0) + amount) * 100) / 100;
    }
    return acumulador;
  }, {});
