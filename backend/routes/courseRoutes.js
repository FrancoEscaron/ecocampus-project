const express = require("express");
const router = express.Router();
const Course = require("../models/course-schema");
const User = require("../models/user-schema");

router.get("/", async (req, res) => {
    try {
        const courses = await Course.find();
        res.json({ success: true, courses });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post("/buy", async (req, res) => {
    try {
        const { userId, courseId } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "Usuario no encontrado" });

        if (!user.coursesOwned.includes(courseId)) {
            user.coursesOwned.push(courseId);
            await user.save();
        }

        res.json({ success: true, message: "Curso desbloqueado con éxito", coursesOwned: user.coursesOwned });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
