const express = require("express");
const rateLimit = require("express-rate-limit");
const Form = require("../models/form-schema");
const { cleanString, isEmail } = require("../utils/validation");

const router = express.Router();

const contactLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 5,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { success: false, message: "Enviaste demasiados mensajes. Esperá un minuto antes de volver a intentar." }
});

router.post("/contacto", contactLimiter, async (req, res, next) => {
    try {
        const body = req.body || {};
        const nombre = cleanString(body.nombre);
        const apellido = cleanString(body.apellido);
        const correo = cleanString(body.correo).toLowerCase();
        const mensaje = cleanString(body.mensaje);
        const errors = [];

        if (nombre.length < 2 || nombre.length > 80) errors.push("El nombre debe tener entre 2 y 80 caracteres.");
        if (apellido.length < 2 || apellido.length > 80) errors.push("El apellido debe tener entre 2 y 80 caracteres.");
        if (!isEmail(correo)) errors.push("El correo electrónico no es válido.");
        if (mensaje.length < 10 || mensaje.length > 2000) errors.push("El mensaje debe tener entre 10 y 2000 caracteres.");

        if (errors.length) {
            return res.status(400).json({ success: false, message: "Datos inválidos.", errors });
        }

        const nuevoFormulario = new Form({ nombre, apellido, correo, mensaje });
        await nuevoFormulario.save();

        res.status(201).json({ success: true, message: "¡Mensaje enviado con éxito!" });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: "Este correo ya ha enviado un formulario anteriormente." });
        }
        next(error);
    }
});

module.exports = router;
