const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: String, required: true },
    modulesCount: { type: Number, required: true },
    level: { type: String, enum: ["principiante", "intermedio", "avanzado", "todos"], default: "todos" },
    image: { type: String, required: true },
    contentDetails: { type: String, required: true },
    pointsCost: { type: Number, default: 30, min: 0 },
    price: { type: Number, default: 0, min: 0 },
    currency: { type: String, enum: ["UYU", "USD"], default: "UYU" },
    videoUrl: { type: String, default: "" },
    pdfUrl: { type: String, default: "" },
    archived: { type: Date, default: null }
}, {
    timestamps: true
});

module.exports = mongoose.model('course', courseSchema);