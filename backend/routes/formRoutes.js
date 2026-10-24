const express = require("express");
const router = express.Router();
const Form = require("../models/form-schema")

router.post("/contacto", async (req, res) => {
    try {
        const { nombre, apellido, correo, mensaje } = req.body;

        const nuevoFormulario = new Form({
            nombre,
            apellido,
            correo,
            mensaje
        });

        await nuevoFormulario.save();
        res.status(201).json({ success: true, message: "¡Mensaje enviado con éxito!" });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "Este correo ya ha enviado un formulario anteriormente." });
        }
        res.status(500).json({ succes: false, error: "Error interno del servidor", detalle: error.message });
    }
});

module.exports = router;