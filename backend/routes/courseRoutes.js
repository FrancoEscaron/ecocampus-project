const express = require("express");
const Course = require("../models/course-schema");
const User = require("../models/user-schema");
const { requireAuth } = require("../middleware/adminAuth");
const { isValidId, toNumber } = require("../utils/validation");

const router = express.Router();

const roundMoney = (value) => Math.round(value * 100) / 100;

const getPaymentMethod = (pointsUsed, moneySpent) => {
    if (pointsUsed > 0 && moneySpent > 0) return "mixed";
    if (pointsUsed > 0) return "eco-points";
    if (moneySpent > 0) return "money";
    return "free";
};

router.get("/", async (req, res, next) => {
    try {
        const courses = await Course.find({ archived: null });
        res.json({ success: true, data: courses });
    } catch (error) {
        next(error);
    }
});

router.post("/buy", requireAuth, async (req, res, next) => {
    try {
        const { courseId, pointsUsed: requestedPoints } = req.body || {};

        if (!isValidId(courseId)) {
            return res.status(400).json({ success: false, message: "El identificador del curso no es válido." });
        }

        const course = await Course.findOne({ _id: courseId, archived: null }).select("title pointsCost price currency");
        if (!course) {
            return res.status(404).json({ success: false, message: "Curso no encontrado o no disponible." });
        }

        const user = await User.findById(req.authUser._id);
        if (!user) {
            return res.status(401).json({ success: false, message: "Sesión inválida." });
        }

        const alreadyOwned = user.coursesOwned.some((ownedId) => ownedId.equals(course._id));
        if (alreadyOwned) {
            return res.status(409).json({
                success: false,
                message: "Ya tenés acceso a este curso.",
                data: { coursesOwned: user.coursesOwned, ecoPoints: user.ecoPoints }
            });
        }

        const pointsCost = Math.max(0, Math.floor(Number(course.pointsCost) || 0));
        const price = Math.max(0, Number(course.price) || 0);
        const currency = course.currency || "UYU";
        const availablePoints = Math.max(0, Math.floor(Number(user.ecoPoints) || 0));

        let pointsUsed;
        if (requestedPoints === undefined || requestedPoints === null || requestedPoints === "") {
            pointsUsed = pointsCost;
        } else {
            pointsUsed = toNumber(requestedPoints, { min: 0, max: pointsCost, integer: true });
            if (pointsUsed === null) {
                return res.status(400).json({
                    success: false,
                    message: `La cantidad de Eco-Points debe ser un número entero entre 0 y ${pointsCost}.`,
                    data: { pointsCost, price, currency }
                });
            }
        }

        if (price === 0 && pointsUsed !== pointsCost) {
            return res.status(400).json({
                success: false,
                message: pointsCost > 0
                    ? "Este curso debe pagarse en su totalidad con Eco-Points."
                    : "Este curso no tiene un costo en Eco-Points.",
                data: { pointsCost, price, currency }
            });
        }

        if (pointsUsed > availablePoints) {
            return res.status(400).json({
                success: false,
                message: "No tenés Eco-Points suficientes para ese reparto.",
                data: { ecoPoints: availablePoints, required: pointsUsed, pointsCost, price, currency }
            });
        }

        const moneySpent = pointsCost > 0
            ? roundMoney(price * (1 - pointsUsed / pointsCost))
            : roundMoney(price);
        const paymentMethod = getPaymentMethod(pointsUsed, moneySpent);

        const updated = await User.findOneAndUpdate(
            {
                _id: user._id,
                coursesOwned: { $ne: course._id },
                ecoPoints: { $gte: pointsUsed }
            },
            {
                $addToSet: { coursesOwned: course._id },
                $inc: { ecoPoints: -pointsUsed },
                $push: {
                    pointsPurchases: {
                        course: course._id,
                        pointsSpent: pointsUsed,
                        moneySpent,
                        currency,
                        paymentMethod,
                        paymentStatus: "simulated"
                    }
                }
            },
            { returnDocument: "after" }
        );

        if (!updated) {
            return res.status(409).json({ success: false, message: "No se pudo completar la compra. Intentá nuevamente." });
        }

        const purchase = updated.pointsPurchases[updated.pointsPurchases.length - 1];

        res.json({
            success: true,
            message: moneySpent > 0
                ? "Compra simulada completada. Curso desbloqueado con éxito."
                : "Curso desbloqueado con éxito.",
            data: {
                coursesOwned: updated.coursesOwned,
                ecoPoints: updated.ecoPoints,
                purchase: {
                    pointsSpent: purchase.pointsSpent,
                    moneySpent: purchase.moneySpent,
                    currency: purchase.currency,
                    paymentMethod: purchase.paymentMethod,
                    paymentStatus: purchase.paymentStatus
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
