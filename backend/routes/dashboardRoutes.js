const express = require("express");
const User = require("../models/user-schema");
const ActionSubmission = require("../models/actionSubmission-schema");
const CourseProgress = require("../models/courseProgress-schema");
const { requireAuth } = require("../middleware/adminAuth");
const { getCompletedModules } = require("../utils/courseProgress");

const router = express.Router();

router.get("/", requireAuth, async (req, res, next) => {
    try {
        const user = await User.findById(req.authUser._id)
            .select("name lastName email role ecoPoints coursesOwned pointsPurchases createdAt")
            .populate("coursesOwned", "title description duration modulesCount level image contentDetails modules pointsCost price currency videoUrl pdfUrl archived")
            .populate("pointsPurchases.course", "title image pointsCost price currency")
            .lean();

        if (!user) {
            return res.status(401).json({ success: false, message: "Sesión inválida." });
        }

        const submissions = await ActionSubmission.find({ user: req.authUser._id })
            .sort({ submittedAt: -1 })
            .lean();

        const cursosBase = (user.coursesOwned || [])
            .filter((course) => course && !course.archived);

        const progresos = cursosBase.length
            ? await CourseProgress.find({
                user: user._id,
                course: { $in: cursosBase.map((course) => course._id) }
            }).lean()
            : [];

        const progresoPorCurso = new Map(
            progresos.map((progreso) => [String(progreso.course), progreso])
        );

        const courses = cursosBase.map((course) => ({
            ...course,
            _id: String(course._id),
            progress: {
                completed: getCompletedModules(progresoPorCurso.get(String(course._id)), course).length,
                total: (course.modules || []).length
            }
        }));

        const purchases = (user.pointsPurchases || [])
            .filter((purchase) => purchase.course || purchase.courseTitle)
            .sort((a, b) => new Date(b.purchasedAt) - new Date(a.purchasedAt))
            .map((purchase) => ({
                ...purchase,
                course: purchase.course
                    ? { ...purchase.course, _id: String(purchase.course._id) }
                    : null
            }));

        const stats = submissions.reduce((accumulator, submission) => {
            if (submission.status === "pending") accumulator.pending += 1;
            if (submission.status === "approved") {
                accumulator.approved += 1;
                accumulator.pointsEarned += Number(submission.pointsValue) || 0;
            }
            if (submission.status === "rejected") accumulator.rejected += 1;
            return accumulator;
        }, { pending: 0, approved: 0, rejected: 0, pointsEarned: 0 });

        const earnedMovements = submissions
            .filter((submission) => submission.status === "approved")
            .map((submission) => ({
                _id: `earned-${submission._id}`,
                type: "earned",
                points: Number(submission.pointsValue) || 0,
                description: submission.actionType || "Acción aprobada",
                date: submission.reviewedAt || submission.submittedAt
            }));

        const spentMovements = purchases
            .filter((purchase) => (Number(purchase.pointsSpent) || 0) > 0 && !purchase.refundedAt)
            .map((purchase) => ({
                _id: `spent-${purchase._id}`,
                type: "spent",
                points: Number(purchase.pointsSpent) || 0,
                description: purchase.course?.title || purchase.courseTitle || "Curso desbloqueado",
                date: purchase.purchasedAt
            }));

        const pointsHistory = [...earnedMovements, ...spentMovements]
            .filter((movement) => movement.points > 0)
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        stats.pointsSpent = spentMovements.reduce(
            (total, movement) => total + movement.points,
            0
        );

        res.json({
            success: true,
            data: {
                user: {
                    id: String(user._id),
                    name: user.name,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    ecoPoints: user.ecoPoints ?? 0,
                    memberSince: user.createdAt
                },
                stats: {
                    ...stats,
                    pointsBalance: user.ecoPoints ?? 0,
                    coursesOwned: courses.length
                },
                courses,
                submissions,
                purchases,
                pointsHistory
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
