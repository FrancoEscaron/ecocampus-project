const crypto = require("crypto");
const Certificate = require("../models/certificate-schema");
const { isCourseComplete } = require("./courseProgress");

const generateCode = () => `ECO-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;

const findCertificate = (userId, courseId) =>
    Certificate.findOne({ user: userId, course: courseId });

const issueCertificate = async (user, course, progress) => {
    const existing = await findCertificate(user._id, course._id);
    if (existing) return existing;

    if (!isCourseComplete(progress, course)) return null;

    try {
        return await Certificate.create({
            user: user._id,
            course: course._id,
            code: generateCode(),
            studentName: `${user.name} ${user.lastName}`.trim(),
            courseTitle: course.title,
            duration: course.duration || "",
            issuedAt: progress?.completedAt || new Date()
        });
    } catch (error) {
        if (error.code === 11000) return findCertificate(user._id, course._id);
        throw error;
    }
};

module.exports = { issueCertificate };
