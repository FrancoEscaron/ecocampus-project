const mongoose = require("mongoose");
const { IMPACT_METRIC_KEYS } = require("../utils/actionTaxonomy");

const actionSubmissionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    actionKey: { type: String, trim: true, default: "" },
    actionType: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    quantity: { type: Number, default: 1, min: 0.01 },
    unit: { type: String, default: "acciones", trim: true },
    impactMetric: { type: String, enum: IMPACT_METRIC_KEYS, default: "acciones" },
    pointsValue: { type: Number, required: true, min: 0 },
    evidenceUrl: { type: String, required: true, trim: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    submittedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date, default: null },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user', default: null }
}, {
    timestamps: true
});

actionSubmissionSchema.index(
    { user: 1, actionKey: 1 },
    {
        unique: true,
        partialFilterExpression: {
            actionKey: { $gt: "" },
            status: { $in: ["pending", "approved"] }
        }
    }
);

module.exports = mongoose.model('actionSubmission', actionSubmissionSchema);
