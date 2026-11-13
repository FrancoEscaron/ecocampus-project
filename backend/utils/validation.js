const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;

const cleanString = (value) => (typeof value === "string" ? value.trim() : "");

const isEmail = (value) => EMAIL_REGEX.test(cleanString(value).toLowerCase());

const isPasswordValid = (value) =>
    typeof value === "string" && value.length >= 8 && value.length <= 128;

const toNumber = (value, options = {}) => {
    const { min = 0, max = 1000000, integer = false } = options;
    const number = Number(value);
    if (!Number.isFinite(number) || number < min || number > max) return null;
    if (integer && !Number.isInteger(number)) return null;
    return number;
};

const isValidId = (value) => typeof value === "string" && OBJECT_ID_REGEX.test(value);

const isOneOf = (value, allowed) => allowed.includes(value);

const slugify = (value) => cleanString(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

module.exports = {
    cleanString,
    isEmail,
    isPasswordValid,
    toNumber,
    isValidId,
    isOneOf,
    slugify
};
