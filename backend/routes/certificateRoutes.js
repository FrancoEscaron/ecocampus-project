const express = require("express");
const Course = require("../models/course-schema");
const CourseProgress = require("../models/courseProgress-schema");
const Certificate = require("../models/certificate-schema");
const { requireAuth } = require("../middleware/adminAuth");
const { isValidId } = require("../utils/validation");
const { issueCertificate } = require("../utils/certificates");

const router = express.Router();

const ownsCourse = (user, course) =>
    user.role === "admin" || (user.coursesOwned || []).some((ownedId) => String(ownedId) === String(course._id));

const toPublicCertificate = (certificate) => ({
    code: certificate.code,
    studentName: certificate.studentName,
    courseTitle: certificate.courseTitle,
    duration: certificate.duration || "",
    issuedAt: certificate.issuedAt
});

router.get("/:courseId", requireAuth, async (req, res, next) => {
    try {
        if (!isValidId(req.params.courseId)) {
            return res.status(400).json({ success: false, message: "Identificador de curso inválido." });
        }

        const existing = await Certificate.findOne({
            user: req.authUser._id,
            course: req.params.courseId
        });

        if (existing) {
            return res.json({ success: true, data: toPublicCertificate(existing) });
        }

        const course = await Course.findOne({ _id: req.params.courseId, archived: null });
        if (!course) {
            return res.status(404).json({ success: false, message: "Curso no encontrado o no disponible." });
        }

        if (!ownsCourse(req.authUser, course)) {
            return res.status(403).json({ success: false, message: "Necesitás desbloquear este curso para obtener el certificado." });
        }

        const progress = await CourseProgress.findOne({
            user: req.authUser._id,
            course: course._id
        }).lean();

        const certificate = await issueCertificate(req.authUser, course, progress);
        if (!certificate) {
            return res.status(409).json({ success: false, message: "Todavía no completaste todos los módulos de este curso." });
        }

        res.json({ success: true, data: toPublicCertificate(certificate) });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
