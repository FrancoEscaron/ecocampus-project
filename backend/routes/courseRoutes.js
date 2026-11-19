const express = require("express");
const Course = require("../models/course-schema");
const CourseProgress = require("../models/courseProgress-schema");
const User = require("../models/user-schema");
const { requireAuth } = require("../middleware/adminAuth");
const { isValidId, toNumber } = require("../utils/validation");
const { notify } = require("../utils/mailer");
const { buildPurchaseEmail } = require("../utils/emailTemplates");
const { issueCertificate } = require("../utils/certificates");
const { getCompletedModules, isCourseComplete } = require("../utils/courseProgress");

const router = express.Router();

const roundMoney = (value) => Math.round(value * 100) / 100;

const ownsCourse = (user, course) =>
    user.role === "admin" || (user.coursesOwned || []).some((ownedId) => String(ownedId) === String(course._id));

const toPublicCourse = (course) => {
    const data = typeof course.toObject === "function" ? course.toObject() : { ...course };

    delete data.contentDetails;
    delete data.videoUrl;
    delete data.pdfUrl;
    data.modules = (data.modules || []).map((module) => ({
        _id: String(module._id),
        title: module.title
    }));

    return data;
};

const getPaymentMethod = (pointsUsed, moneySpent) => {
    if (pointsUsed > 0 && moneySpent > 0) return "mixed";
    if (pointsUsed > 0) return "eco-points";
    if (moneySpent > 0) return "money";
    return "free";
};

router.get("/", async (req, res, next) => {
    try {
        const courses = await Course.find({ archived: null });
        res.json({ success: true, data: courses.map(toPublicCourse) });
    } catch (error) {
        next(error);
    }
});

router.get("/:id", async (req, res, next) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ success: false, message: "Identificador de curso inválido." });
        }

        const course = await Course.findOne({ _id: req.params.id, archived: null });
        if (!course) {
            return res.status(404).json({ success: false, message: "Curso no encontrado o no disponible." });
        }

        res.json({ success: true, data: toPublicCourse(course) });
    } catch (error) {
        next(error);
    }
});

router.get("/:id/content", requireAuth, async (req, res, next) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ success: false, message: "Identificador de curso inválido." });
        }

        const course = await Course.findOne({ _id: req.params.id, archived: null });
        if (!course) {
            return res.status(404).json({ success: false, message: "Curso no encontrado o no disponible." });
        }

        if (!ownsCourse(req.authUser, course)) {
            return res.status(403).json({ success: false, message: "Necesitás desbloquear este curso para ver su contenido." });
        }

        const progress = await CourseProgress.findOne({
            user: req.authUser._id,
            course: course._id
        }).lean();

        res.json({
            success: true,
            data: {
                course: { _id: String(course._id), title: course.title },
                modules: (course.modules || []).map((module) => ({
                    _id: String(module._id),
                    title: module.title,
                    description: module.description || "",
                    videoUrl: module.videoUrl || "",
                    pdfUrl: module.pdfUrl || ""
                })),
                videoUrl: course.videoUrl || "",
                pdfUrl: course.pdfUrl || "",
                contentDetails: course.contentDetails || "",
                completedModules: getCompletedModules(progress, course)
            }
        });
    } catch (error) {
        next(error);
    }
});

router.put("/:id/modules/:moduleId", requireAuth, async (req, res, next) => {
    try {
        if (!isValidId(req.params.id) || !isValidId(req.params.moduleId)) {
            return res.status(400).json({ success: false, message: "Identificador de curso o módulo inválido." });
        }

        const { completed } = req.body || {};
        if (typeof completed !== "boolean") {
            return res.status(400).json({ success: false, message: "El estado del módulo debe ser verdadero o falso." });
        }

        const course = await Course.findOne({ _id: req.params.id, archived: null });
        if (!course) {
            return res.status(404).json({ success: false, message: "Curso no encontrado o no disponible." });
        }

        if (!ownsCourse(req.authUser, course)) {
            return res.status(403).json({ success: false, message: "Necesitás desbloquear este curso para registrar tu progreso." });
        }

        const module = course.modules.id(req.params.moduleId);
        if (!module) {
            return res.status(404).json({ success: false, message: "Módulo no encontrado." });
        }

        const update = completed
            ? { $addToSet: { completedModules: module._id } }
            : { $pull: { completedModules: module._id } };

        const progress = await CourseProgress.findOneAndUpdate(
            { user: req.authUser._id, course: course._id },
            update,
            { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
        );

        const completo = isCourseComplete(progress, course);

        if (completo && !progress.completedAt) {
            progress.completedAt = new Date();
            await progress.save();
        } else if (!completo && progress.completedAt) {
            progress.completedAt = null;
            await progress.save();
        }

        if (completo) {
            try {
                await issueCertificate(req.authUser, course, progress);
            } catch (error) {
                console.error("No se pudo emitir el certificado:", error.message);
            }
        }

        res.json({
            success: true,
            message: completed ? "Módulo marcado como completado." : "Módulo desmarcado.",
            data: {
                completedModules: getCompletedModules(progress, course)
            }
        });
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
                        courseTitle: course.title,
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

        if (updated.email) {
            notify(() => buildPurchaseEmail({
                to: updated.email,
                nombre: updated.name,
                curso: course.title,
                puntosUsados: purchase.pointsSpent,
                dinero: purchase.moneySpent,
                moneda: purchase.currency,
                metodo: purchase.paymentMethod,
                totalPuntos: updated.ecoPoints
            }));
        }

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
