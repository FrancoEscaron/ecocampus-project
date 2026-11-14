const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const User = require("../models/user-schema");
const { cleanString, isEmail, isPasswordValid } = require("../utils/validation");

const router = express.Router();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: { success: false, message: "Demasiados intentos fallidos. Esperá 15 minutos antes de volver a intentar." }
});

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { success: false, message: "Demasiados registros desde esta IP. Esperá una hora antes de volver a intentar." }
});

const signToken = (user) =>
    jwt.sign(
        { id: user._id.toString(), role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "2h" }
    );

router.post("/register", registerLimiter, async (req, res, next) => {
    try {
        const body = req.body || {};
        const name = cleanString(body.name);
        const lastName = cleanString(body.lastName);
        const email = cleanString(body.email).toLowerCase();
        const password = typeof body.password === "string" ? body.password : "";
        const errors = [];

        if (name.length < 2 || name.length > 80) errors.push("El nombre debe tener entre 2 y 80 caracteres.");
        if (lastName.length < 2 || lastName.length > 80) errors.push("El apellido debe tener entre 2 y 80 caracteres.");
        if (!isEmail(email)) errors.push("El correo electrónico no es válido.");
        if (!isPasswordValid(password)) errors.push("La contraseña debe tener entre 8 y 128 caracteres.");

        if (errors.length) {
            return res.status(400).json({ success: false, message: "Datos inválidos.", errors });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ success: false, message: "El correo ya se encuentra registrado." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const nuevoUsuario = new User({ name, lastName, email, password: hashedPassword });
        await nuevoUsuario.save();

        res.status(201).json({ success: true, message: "¡Usuario registrado con éxito!" });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: "El correo ya se encuentra registrado." });
        }
        next(error);
    }
});

router.post("/login", loginLimiter, async (req, res, next) => {
    try {
        const body = req.body || {};
        const email = cleanString(body.email).toLowerCase();
        const password = typeof body.password === "string" ? body.password : "";

        if (!isEmail(email) || !password) {
            return res.status(400).json({ success: false, message: "Ingresá un correo y una contraseña válidos." });
        }

        const foundUser = await User.findOne({ email });
        if (!foundUser) {
            return res.status(401).json({ success: false, message: "Correo o contraseña incorrectos." });
        }

        const isMatch = await bcrypt.compare(password, foundUser.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Correo o contraseña incorrectos." });
        }

        const token = signToken(foundUser);

        res.json({
            success: true,
            message: "Inicio de sesión exitoso",
            data: {
                token,
                user: {
                    id: foundUser._id,
                    name: foundUser.name,
                    lastName: foundUser.lastName,
                    email: foundUser.email,
                    role: foundUser.role,
                    coursesOwned: foundUser.coursesOwned,
                    ecoPoints: foundUser.ecoPoints
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
