const express = require("express");
const FAQ = require("../models/faq-schema");

const router = express.Router();

router.get("/", async (req, res, next) => {
    try {
        const faqs = await FAQ.find().sort({ createdAt: 1 });
        res.json({ success: true, data: faqs });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
