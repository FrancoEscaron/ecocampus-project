const express = require("express");
const Course = require("../models/course-schema");
const Action = require("../models/action-schema");
const ActionSubmission = require("../models/actionSubmission-schema");
const User = require("../models/user-schema");
const FAQ = require("../models/faq-schema");
const { requireAuth, requireAdmin } = require("../middleware/adminAuth");
const { uploadCourseImage, uploadActionImage, removeUploadedFile, removeStoredFile } = require("../middleware/imageUpload");
const { cleanString, toNumber, isValidId, isOneOf, slugify } = require("../utils/validation");
const { IMPACT_METRICS, IMPACT_METRIC_KEYS } = require("../utils/actionTaxonomy");

const router = express.Router();

const buildCourseData = (body, partial) => {
    const data = {};
    const errors = [];

    const readText = (key, label, min, max) => {
        if (partial && body[key] === undefined) return;
        const value = cleanString(body[key]);
        if (value.length < min || value.length > max) {
            errors.push(`${label} debe tener entre ${min} y ${max} caracteres.`);
            return;
        }
        data[key] = value;
    };

    readText("title", "El título", 3, 120);
    readText("description", "La descripción", 10, 2000);
    readText("duration", "La duración", 2, 80);
    readText("contentDetails", "El contenido detallado", 5, 5000);
    readText("videoUrl", "La URL del video", 0, 500);
    readText("pdfUrl", "La URL del PDF", 0, 500);

    if (!partial || body.level !== undefined) {
        const level = cleanString(body.level) || "todos";
        if (!isOneOf(level, ["principiante", "intermedio", "avanzado", "todos"])) {
            errors.push("El nivel debe ser principiante, intermedio, avanzado o todos.");
        } else {
            data.level = level;
        }
    }

    const pointsRaw = body.pointsCost;
    if (!partial || pointsRaw !== undefined) {
        const points = toNumber(pointsRaw ?? 30, { min: 0, max: 100000, integer: true });
        if (points === null) errors.push("Los Eco-Points deben ser un entero entre 0 y 100000.");
        else data.pointsCost = points;
    }

    if (!partial || body.price !== undefined) {
        const price = toNumber(body.price ?? 0, { min: 0, max: 1000000 });
        if (price === null) errors.push("El precio debe ser un número entre 0 y 1000000.");
        else data.price = price;
    }

    if (!partial || body.currency !== undefined) {
        const currency = cleanString(body.currency) || "UYU";
        if (!isOneOf(currency, ["UYU", "USD"])) errors.push("La moneda debe ser UYU o USD.");
        else data.currency = currency;
    }

    if (!partial || body.modulesCount !== undefined) {
        const modulesCount = toNumber(body.modulesCount, { min: 0, max: 1000, integer: true });
        if (modulesCount === null) errors.push("La cantidad de módulos debe ser un entero entre 0 y 1000.");
        else data.modulesCount = modulesCount;
    }

    return { data, errors };
};

const buildFaqData = (body) => {
    const question = cleanString(body.question);
    const answer = cleanString(body.answer);
    const errors = [];

    if (question.length < 5 || question.length > 300) errors.push("La pregunta debe tener entre 5 y 300 caracteres.");
    if (answer.length < 5 || answer.length > 2000) errors.push("La respuesta debe tener entre 5 y 2000 caracteres.");

    return { data: { question, answer }, errors };
};

const buildActionData = (body, partial) => {
    const data = {};
    const errors = [];

    const readText = (key, label, min, max) => {
        if (partial && body[key] === undefined) return;
        const value = cleanString(body[key]);
        if (value.length < min || value.length > max) {
            errors.push(`${label} debe tener entre ${min} y ${max} caracteres.`);
            return;
        }
        data[key] = value;
    };

    readText("title", "El título", 3, 120);
    readText("description", "La descripción", 10, 1000);
    readText("imageAlt", "El texto alternativo", 0, 200);

    if (!partial || body.impactMetric !== undefined) {
        const impactMetric = cleanString(body.impactMetric);
        if (!isOneOf(impactMetric, IMPACT_METRIC_KEYS)) {
            errors.push("El impacto debe ser residuos, árboles, horas, energía, electrónicos o acciones.");
        } else {
            data.impactMetric = impactMetric;
        }
    }

    if (!partial || body.pointsPerUnit !== undefined || body.points !== undefined) {
        const points = toNumber(body.pointsPerUnit ?? body.points, { min: 0, max: 100000, integer: true });
        if (points === null) errors.push("Los Eco-Points por unidad deben ser un entero entre 0 y 100000.");
        else data.pointsPerUnit = points;
    }

    if (!partial || body.order !== undefined) {
        const order = toNumber(body.order ?? 0, { min: 0, max: 1000, integer: true });
        if (order === null) errors.push("El orden debe ser un entero entre 0 y 1000.");
        else data.order = order;
    }

    return { data, errors };
};

const createUniqueActionKey = async (title) => {
    const base = slugify(title) || "accion";
    let key = base;
    let suffix = 2;

    while (await Action.exists({ key })) {
        key = `${base}-${suffix}`;
        suffix += 1;
    }

    return key;
};

router.use(requireAuth, requireAdmin);

router.get("/courses", async (req, res, next) => {
    try {
        const courses = await Course.find().sort({ createdAt: -1 });
        res.json({ success: true, data: courses });
    } catch (error) {
        next(error);
    }
});

router.post("/courses", uploadCourseImage, async (req, res, next) => {
    try {
        const { data, errors } = buildCourseData(req.body || {}, false);
        if (!req.file) errors.push("La imagen del curso es obligatoria.");

        if (errors.length) {
            removeUploadedFile(req.file);
            return res.status(400).json({ success: false, message: "Datos inválidos.", errors });
        }

        data.image = `/uploads/${req.file.filename}`;
        const nuevoCurso = new Course(data);
        await nuevoCurso.save();

        res.status(201).json({ success: true, message: "Curso creado con éxito", data: { course: nuevoCurso } });
    } catch (error) {
        removeUploadedFile(req.file);
        next(error);
    }
});

router.put("/courses/:id", uploadCourseImage, async (req, res, next) => {
    try {
        if (!isValidId(req.params.id)) {
            removeUploadedFile(req.file);
            return res.status(400).json({ success: false, message: "Identificador de curso inválido." });
        }

        const existingCourse = await Course.findById(req.params.id);
        if (!existingCourse) {
            removeUploadedFile(req.file);
            return res.status(404).json({ success: false, message: "Curso no encontrado." });
        }

        const { data, errors } = buildCourseData(req.body || {}, true);
        if (req.file) data.image = `/uploads/${req.file.filename}`;

        if (errors.length) {
            removeUploadedFile(req.file);
            return res.status(400).json({ success: false, message: "Datos inválidos.", errors });
        }

        if (Object.keys(data).length === 0) {
            removeUploadedFile(req.file);
            return res.status(400).json({ success: false, message: "No hay cambios para aplicar." });
        }

        const cursoActualizado = await Course.findByIdAndUpdate(req.params.id, data, { returnDocument: "after", runValidators: true });
        if (!cursoActualizado) {
            removeUploadedFile(req.file);
            return res.status(404).json({ success: false, message: "Curso no encontrado." });
        }

        if (req.file && existingCourse.image !== cursoActualizado.image) {
            removeStoredFile(existingCourse.image);
        }

        res.json({ success: true, message: "Curso actualizado con éxito", data: { course: cursoActualizado } });
    } catch (error) {
        removeUploadedFile(req.file);
        next(error);
    }
});

router.put("/courses/:id/archive", async (req, res, next) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ success: false, message: "Identificador de curso inválido." });
        }

        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ success: false, message: "Curso no encontrado." });
        }

        course.archived = course.archived ? null : new Date();
        await course.save();

        res.json({
            success: true,
            message: course.archived ? "Curso archivado con éxito" : "Curso reactivado con éxito",
            data: { course }
        });
    } catch (error) {
        next(error);
    }
});

router.delete("/courses/:id", async (req, res, next) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ success: false, message: "Identificador de curso inválido." });
        }

        const cursoEliminado = await Course.findByIdAndDelete(req.params.id);
        if (!cursoEliminado) {
            return res.status(404).json({ success: false, message: "Curso no encontrado." });
        }

        removeStoredFile(cursoEliminado.image);
        await User.updateMany({ coursesOwned: cursoEliminado._id }, { $pull: { coursesOwned: cursoEliminado._id } });

        res.json({ success: true, message: "Curso eliminado con éxito" });
    } catch (error) {
        next(error);
    }
});

router.get("/action-catalog", async (req, res, next) => {
    try {
        const actions = await Action.find().sort({ order: 1, createdAt: 1 }).lean();
        const counts = await ActionSubmission.aggregate([
            { $match: { actionKey: { $ne: "" } } },
            { $group: { _id: "$actionKey", count: { $sum: 1 } } }
        ]);
        const countMap = new Map(counts.map((item) => [item._id, item.count]));

        res.json({
            success: true,
            data: actions.map((action) => ({
                ...action,
                unit: IMPACT_METRICS[action.impactMetric]?.unit || "acciones",
                submissionCount: countMap.get(action.key) || 0
            }))
        });
    } catch (error) {
        next(error);
    }
});

router.post("/action-catalog", uploadActionImage, async (req, res, next) => {
    try {
        const { data, errors } = buildActionData(req.body || {}, false);
        if (!req.file) errors.push("La imagen de la acción es obligatoria.");

        if (errors.length) {
            removeUploadedFile(req.file);
            return res.status(400).json({ success: false, message: "Datos inválidos.", errors });
        }

        data.key = await createUniqueActionKey(data.title);
        data.image = `/uploads/${req.file.filename}`;

        const action = new Action(data);
        await action.save();

        res.status(201).json({ success: true, message: "Acción creada con éxito", data: { action } });
    } catch (error) {
        removeUploadedFile(req.file);
        next(error);
    }
});

router.put("/action-catalog/:id/archive", async (req, res, next) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ success: false, message: "Identificador de acción inválido." });
        }

        const action = await Action.findById(req.params.id);
        if (!action) {
            return res.status(404).json({ success: false, message: "Acción no encontrada." });
        }

        action.archived = action.archived ? null : new Date();
        await action.save();

        res.json({
            success: true,
            message: action.archived ? "Acción archivada con éxito" : "Acción reactivada con éxito",
            data: { action }
        });
    } catch (error) {
        next(error);
    }
});

router.put("/action-catalog/:id", uploadActionImage, async (req, res, next) => {
    try {
        if (!isValidId(req.params.id)) {
            removeUploadedFile(req.file);
            return res.status(400).json({ success: false, message: "Identificador de acción inválido." });
        }

        const existingAction = await Action.findById(req.params.id);
        if (!existingAction) {
            removeUploadedFile(req.file);
            return res.status(404).json({ success: false, message: "Acción no encontrada." });
        }

        const { data, errors } = buildActionData(req.body || {}, true);
        if (req.file) data.image = `/uploads/${req.file.filename}`;

        if (errors.length) {
            removeUploadedFile(req.file);
            return res.status(400).json({ success: false, message: "Datos inválidos.", errors });
        }

        if (Object.keys(data).length === 0) {
            removeUploadedFile(req.file);
            return res.status(400).json({ success: false, message: "No hay cambios para aplicar." });
        }

        const updatedAction = await Action.findByIdAndUpdate(req.params.id, data, { returnDocument: "after", runValidators: true });
        if (!updatedAction) {
            removeUploadedFile(req.file);
            return res.status(404).json({ success: false, message: "Acción no encontrada." });
        }

        if (req.file && existingAction.image !== updatedAction.image) {
            removeStoredFile(existingAction.image);
        }

        res.json({ success: true, message: "Acción actualizada con éxito", data: { action: updatedAction } });
    } catch (error) {
        removeUploadedFile(req.file);
        next(error);
    }
});

router.delete("/action-catalog/:id", async (req, res, next) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ success: false, message: "Identificador de acción inválido." });
        }

        const action = await Action.findById(req.params.id);
        if (!action) {
            return res.status(404).json({ success: false, message: "Acción no encontrada." });
        }

        const hasSubmissions = await ActionSubmission.exists({ actionKey: action.key });
        if (hasSubmissions) {
            return res.status(409).json({
                success: false,
                message: "Esta acción tiene envíos asociados. Archivala para ocultarla sin perder el historial."
            });
        }

        await Action.findByIdAndDelete(action._id);
        removeStoredFile(action.image);

        res.json({ success: true, message: "Acción eliminada con éxito" });
    } catch (error) {
        next(error);
    }
});

router.get("/actions/pending", async (req, res, next) => {
    try {
        const pendings = await ActionSubmission.find({ status: "pending" })
            .populate("user", "name lastName email")
            .sort({ submittedAt: 1 });
        res.json({ success: true, data: pendings });
    } catch (error) {
        next(error);
    }
});

router.put("/actions/:id", async (req, res, next) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ success: false, message: "Identificador de acción inválido." });
        }

        const status = cleanString((req.body || {}).status);
        if (!isOneOf(status, ["approved", "rejected"])) {
            return res.status(400).json({ success: false, message: "Estado inválido. Usá approved o rejected." });
        }

        const submission = await ActionSubmission.findOneAndUpdate(
            { _id: req.params.id, status: "pending" },
            { $set: { status, reviewedAt: new Date(), reviewedBy: req.authUser._id } },
            { returnDocument: "after" }
        );

        if (!submission) {
            const exists = await ActionSubmission.exists({ _id: req.params.id });
            if (!exists) {
                return res.status(404).json({ success: false, message: "Evidencia no encontrada." });
            }
            return res.status(409).json({ success: false, message: "Esta evidencia ya fue revisada." });
        }

        if (status === "approved") {
            try {
                const updatedUser = await User.findByIdAndUpdate(submission.user, {
                    $inc: { ecoPoints: submission.pointsValue || 0 },
                    $addToSet: { completedActions: submission._id }
                });

                if (!updatedUser) {
                    await ActionSubmission.findByIdAndUpdate(submission._id, { status: "pending", reviewedAt: null, reviewedBy: null });
                    return res.status(404).json({ success: false, message: "Usuario no encontrado. No se pudieron acreditar los puntos." });
                }
            } catch (pointsError) {
                await ActionSubmission.findByIdAndUpdate(submission._id, { status: "pending", reviewedAt: null, reviewedBy: null });
                throw pointsError;
            }
        }

        const statusLabel = status === "approved" ? "aprobada" : "rechazada";
        res.json({ success: true, message: `Acción ${statusLabel} con éxito`, data: { submission } });
    } catch (error) {
        next(error);
    }
});

router.delete("/actions/:id", async (req, res, next) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ success: false, message: "Identificador de acción inválido." });
        }

        const submission = await ActionSubmission.findById(req.params.id);
        if (!submission) {
            return res.status(404).json({ success: false, message: "Evidencia no encontrada." });
        }

        if (submission.status === "approved") {
            const user = await User.findById(submission.user);
            if (user) {
                user.ecoPoints = Math.max(0, user.ecoPoints - (submission.pointsValue || 0));
                user.completedActions = user.completedActions.filter((actionId) => !actionId.equals(submission._id));
                await user.save();
            }
        }

        await ActionSubmission.findByIdAndDelete(submission._id);
        removeStoredFile(submission.evidenceUrl);
        res.json({ success: true, message: "Acción eliminada con éxito" });
    } catch (error) {
        next(error);
    }
});

router.get("/purchases", async (req, res, next) => {
    try {
        const users = await User.find({
            $or: [
                { "coursesOwned.0": { $exists: true } },
                { "pointsPurchases.0": { $exists: true } }
            ]
        })
            .select("name lastName email coursesOwned pointsPurchases ecoPoints")
            .populate("coursesOwned", "title price currency pointsCost");

        const visibleUsers = users.filter((user) =>
            (user.coursesOwned || []).some(Boolean) || (user.pointsPurchases || []).length > 0
        );

        res.json({ success: true, data: visibleUsers });
    } catch (error) {
        next(error);
    }
});

router.get("/faqs", async (req, res, next) => {
    try {
        const faqs = await FAQ.find().sort({ createdAt: -1 });
        res.json({ success: true, data: faqs });
    } catch (error) {
        next(error);
    }
});

router.post("/faqs", async (req, res, next) => {
    try {
        const { data, errors } = buildFaqData(req.body || {});
        if (errors.length) {
            return res.status(400).json({ success: false, message: "Datos inválidos.", errors });
        }

        const newFaq = new FAQ(data);
        await newFaq.save();

        res.status(201).json({ success: true, message: "Pregunta creada con éxito", data: { faq: newFaq } });
    } catch (error) {
        next(error);
    }
});

router.put("/faqs/:id", async (req, res, next) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ success: false, message: "Identificador de pregunta inválido." });
        }

        const { data, errors } = buildFaqData(req.body || {});
        if (errors.length) {
            return res.status(400).json({ success: false, message: "Datos inválidos.", errors });
        }

        const updatedFaq = await FAQ.findByIdAndUpdate(req.params.id, data, { returnDocument: "after", runValidators: true });
        if (!updatedFaq) {
            return res.status(404).json({ success: false, message: "Pregunta no encontrada." });
        }

        res.json({ success: true, message: "Pregunta actualizada con éxito", data: { faq: updatedFaq } });
    } catch (error) {
        next(error);
    }
});

router.delete("/faqs/:id", async (req, res, next) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ success: false, message: "Identificador de pregunta inválido." });
        }

        const eliminada = await FAQ.findByIdAndDelete(req.params.id);
        if (!eliminada) {
            return res.status(404).json({ success: false, message: "Pregunta no encontrada." });
        }

        res.json({ success: true, message: "Pregunta eliminada" });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
