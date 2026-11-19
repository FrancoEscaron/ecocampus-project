const mongoose = require("mongoose");

const courseProgressSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "course", required: true },
    completedModules: [{ type: mongoose.Schema.Types.ObjectId }],
    completedAt: { type: Date, default: null }
}, {
    timestamps: true
});

courseProgressSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("courseProgress", courseProgressSchema);
