const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/user-schema");

router.post("/register", async (req, res) => {
    try {
        const { name, lastName, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ success: false, message: "El correo ya se encuentra registrado." });

        if (!password) {
            return res.status(400).json({ success: false, message: "La contraseña es obligatoria." })
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const nuevoUsuario = new User({ name, lastName, email, password: hashedPassword });
        await nuevoUsuario.save();
        res.status(201).json({ success: true, message: "¡Usuario registrado con éxito!" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const foundUser = await User.findOne({ email });
        if (!foundUser) return res.status(400).json({ success: false, message: "Correo o contraseña incorrectos." });

        const isMatch = await bcrypt.compare(password, foundUser.password);
        if (!isMatch) return res.status(400).json({ success: false, message: "Correo o contraseña incorrectos." })

        res.json({
            success: true,
            message: "Inicio de sesión exitoso",
            user: { id: foundUser._id, name: foundUser.name, lastName: foundUser.lastName, email: foundUser.email, role: foundUser.role, coursesOwned: foundUser.coursesOwned }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;

