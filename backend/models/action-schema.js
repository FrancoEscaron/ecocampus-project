const mongoose = require("mongoose");
const { IMPACT_METRIC_KEYS } = require("../utils/actionTaxonomy");

const actionSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    pointsPerUnit: { type: Number, required: true, min: 0 },
    impactMetric: { type: String, enum: IMPACT_METRIC_KEYS, required: true },
    image: { type: String, required: true, trim: true },
    imageAlt: { type: String, default: "", trim: true },
    order: { type: Number, default: 0, min: 0 },
    archived: { type: Date, default: null }
}, {
    timestamps: true
});

module.exports = mongoose.model("action", actionSchema);
