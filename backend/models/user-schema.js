const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    name: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    coursesOwned: [{ type: mongoose.Schema.Types.ObjectId, ref: 'course' }],
    pointsPurchases: [{
        course: { type: mongoose.Schema.Types.ObjectId, ref: 'course' },
        courseTitle: { type: String, default: "", trim: true },
        pointsSpent: { type: Number, required: true, min: 0 },
        moneySpent: { type: Number, default: 0, min: 0 },
        currency: { type: String, enum: ["UYU", "USD"], default: "UYU" },
        paymentMethod: { type: String, enum: ["eco-points", "money", "mixed", "free"], default: "eco-points" },
        paymentStatus: { type: String, enum: ["simulated"], default: "simulated" },
        purchasedAt: { type: Date, default: Date.now },
        refundedAt: { type: Date, default: null },
    }],
    ecoPoints: { type: Number, default: 0, min: 0 },
    completedActions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'actionSubmission' }]
}, {
    timestamps: true
});

module.exports = mongoose.model("user", userSchema)