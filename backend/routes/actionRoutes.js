const express = require("express");
const rateLimit = require("express-rate-limit");
const ActionSubmission = require("../models/actionSubmission-schema");
const Action = require("../models/action-schema");
const { requireAuth } = require("../middleware/adminAuth");
const { uploadEvidence, removeUploadedFile } = require("../middleware/imageUpload");
const { cleanString, toNumber } = require("../utils/validation");
const { IMPACT_METRICS } = require("../utils/actionTaxonomy");

const router = express.Router();

const submissionLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { success: false, message: "Enviaste demasiadas evidencias. Esperá una hora antes de volver a intentar." }
});

const withUnit = (action) => ({
    ...action,
    cooldownDays: Number.isFinite(Number(action.cooldownDays)) ? Number(action.cooldownDays) : 30,
    unit: IMPACT_METRICS[action.impactMetric]?.unit || "acciones"
});

const addDays = (date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000);

const formatAvailableDate = (date) =>
    date.toLocaleDateString("es-UY", { day: "2-digit", month: "2-digit", year: "numeric" });

router.get("/catalog", async (req, res, next) => {
    try {
        const actions = await Action.find({ archived: null }).sort({ order: 1, createdAt: 1 }).lean();
        res.json({ success: true, data: actions.map(withUnit) });
    } catch (error) {
        next(error);
    }
});

router.get("/mine", requireAuth, async (req, res, next) => {
    try {
        const submissions = await ActionSubmission.find({ user: req.authUser._id })
            .sort({ submittedAt: -1 });
        res.json({ success: true, data: submissions });
    } catch (error) {
        next(error);
    }
});

router.post("/", requireAuth, submissionLimiter, uploadEvidence, async (req, res, next) => {
    try {
        const actionKey = cleanString((req.body || {}).actionKey);
        const description = cleanString((req.body || {}).description);
        const quantity = toNumber((req.body || {}).quantity, { min: 0.01, max: 100000 });
        const action = await Action.findOne({ key: actionKey, archived: null });

        if (!action) {
            removeUploadedFile(req.file);
            return res.status(400).json({ success: false, message: "La acción seleccionada no es válida." });
        }

        if (description.length < 10 || description.length > 1000) {
            removeUploadedFile(req.file);
            return res.status(400).json({ success: false, message: "La descripción debe tener entre 10 y 1000 caracteres." });
        }

        if (quantity === null) {
            removeUploadedFile(req.file);
            return res.status(400).json({ success: false, message: "La cantidad debe ser un número mayor a 0 y menor o igual a 100000." });
        }

        const impactMetric = IMPACT_METRICS[action.impactMetric] ? action.impactMetric : "acciones";
        const unit = IMPACT_METRICS[impactMetric].unit;
        const wholeUnitMetrics = ["arboles", "electronicos", "acciones"];

        if (wholeUnitMetrics.includes(impactMetric) && !Number.isInteger(quantity)) {
            removeUploadedFile(req.file);
            return res.status(400).json({ success: false, message: "La cantidad debe ser un número entero para esta acción." });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: "La evidencia es obligatoria." });
        }

        const pointsValue = Math.round((action.pointsPerUnit || 0) * quantity);
        if (pointsValue > 1000000) {
            removeUploadedFile(req.file);
            return res.status(400).json({ success: false, message: "La cantidad declarada supera el máximo permitido para esta acción." });
        }

        const pending = await ActionSubmission.findOne({
            user: req.authUser._id,
            actionKey,
            status: "pending"
        });

        if (pending) {
            removeUploadedFile(req.file);
            return res.status(409).json({
                success: false,
                message: "Ya tenés una evidencia pendiente para esta acción.",
                data: { submission: pending }
            });
        }

        const cooldownDays = Math.max(0, Math.floor(Number(action.cooldownDays) || 0));

        if (cooldownDays > 0) {
            const lastApproved = await ActionSubmission.findOne({
                user: req.authUser._id,
                actionKey,
                status: "approved"
            }).sort({ reviewedAt: -1, submittedAt: -1 });

            if (lastApproved) {
                const reviewedAt = lastApproved.reviewedAt || lastApproved.submittedAt || lastApproved.createdAt;
                const availableAt = addDays(new Date(reviewedAt), cooldownDays);

                if (Date.now() < availableAt.getTime()) {
                    removeUploadedFile(req.file);
                    return res.status(409).json({
                        success: false,
                        message: `Esta acción ya fue validada. Podés repetirla a partir del ${formatAvailableDate(availableAt)}.`,
                        data: { availableAt: availableAt.toISOString() }
                    });
                }
            }
        }

        const submission = await ActionSubmission.create({
            user: req.authUser._id,
            actionKey,
            actionType: action.title,
            description,
            quantity,
            unit,
            impactMetric,
            pointsValue,
            evidenceUrl: `/uploads/${req.file.filename}`,
            status: "pending"
        });

        res.status(201).json({
            success: true,
            message: `Evidencia enviada. Queda pendiente de revisión. Puntos estimados: ${pointsValue}.`,
            data: { submission }
        });
    } catch (error) {
        removeUploadedFile(req.file);
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: "Ya tenés una evidencia pendiente para esta acción." });
        }
        next(error);
    }
});

module.exports = router;
