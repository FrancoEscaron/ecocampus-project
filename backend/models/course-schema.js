const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: String, required: true },
    modulesCount: { type: Number, required: true },
    image: { type: String, required: true },
    contentDetails: { type: String, required: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('course', courseSchema);