import { formatMoney } from "../core/format.js";

export const getPurchaseParts = (purchase = {}) => {
    const pointsSpent = Number(purchase.pointsSpent) || 0;
    const moneySpent = Number(purchase.moneySpent) || 0;
    const currency = purchase.currency || purchase.course?.currency || "UYU";
    const parts = [];

    if (pointsSpent > 0) parts.push(`${pointsSpent} Eco-Points`);
    if (moneySpent > 0) parts.push(`${formatMoney(moneySpent, currency)} simulados`);

    return { pointsSpent, moneySpent, currency, parts };
};

export const getPurchaseSummary = (purchase = {}) => {
    const { parts } = getPurchaseParts(purchase);
    return parts.length ? parts.join(" + ") : "Sin costo";
};

export const getMoneyTotalsByCurrency = (purchases = []) =>
    purchases.reduce((accumulator, purchase) => {
        const currency = purchase.currency || "UYU";
        const amount = Number(purchase.moneySpent) || 0;
        if (amount > 0) {
            accumulator[currency] = Math.round(((accumulator[currency] || 0) + amount) * 100) / 100;
        }
        return accumulator;
    }, {});
