const express = require("express");
const ActionSubmission = require("../models/actionSubmission-schema");
const { IMPACT_METRICS } = require("../utils/actionTaxonomy");

const router = express.Router();

const DISPLAY_METRICS = ["residuos", "arboles", "horas", "energia", "electronicos"];

router.get("/", async (req, res, next) => {
    try {
        const rows = await ActionSubmission.aggregate([
            { $match: { status: "approved" } },
            {
                $group: {
                    _id: "$impactMetric",
                    quantity: { $sum: { $ifNull: ["$quantity", 0] } },
                    points: { $sum: { $ifNull: ["$pointsValue", 0] } },
                    count: { $sum: 1 }
                }
            }
        ]);

        const rowMap = new Map(rows.map((row) => [row._id, row]));
        const metrics = DISPLAY_METRICS.map((key) => {
            const definition = IMPACT_METRICS[key];
            const row = rowMap.get(key);

            return {
                key,
                label: definition.label,
                unit: definition.unit,
                icon: definition.icon,
                value: row?.quantity || 0
            };
        });

        const totals = rows.reduce((accumulator, row) => {
            accumulator.approvedActions += row.count;
            accumulator.pointsAwarded += row.points;
            return accumulator;
        }, { approvedActions: 0, pointsAwarded: 0 });

        res.json({ success: true, data: { metrics, totals } });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
