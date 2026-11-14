const express = require("express");
const User = require("../models/user-schema");
const ActionSubmission = require("../models/actionSubmission-schema");
const { requireAuth } = require("../middleware/adminAuth");

const router = express.Router();

router.get("/", requireAuth, async (req, res, next) => {
    try {
        const user = await User.findById(req.authUser._id)
            .select("name lastName email role ecoPoints coursesOwned pointsPurchases createdAt")
            .populate("coursesOwned", "title description duration modulesCount level image contentDetails pointsCost price currency videoUrl pdfUrl archived")
            .populate("pointsPurchases.course", "title image pointsCost price currency")
            .lean();

        if (!user) {
            return res.status(401).json({ success: false, message: "Sesión inválida." });
        }

        const submissions = await ActionSubmission.find({ user: req.authUser._id })
            .sort({ submittedAt: -1 })
            .lean();

        const courses = (user.coursesOwned || [])
            .filter((course) => course && !course.archived)
            .map((course) => ({
                ...course,
                _id: String(course._id)
            }));

        const purchases = (user.pointsPurchases || [])
            .filter((purchase) => purchase.course)
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
                    coursesOwned: courses.length
                },
                courses,
                submissions,
                purchases
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
