const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "course", required: true },
    code: { type: String, required: true, unique: true },
    studentName: { type: String, required: true, trim: true },
    courseTitle: { type: String, required: true, trim: true },
    duration: { type: String, default: "", trim: true },
    issuedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

certificateSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("certificate", certificateSchema);
