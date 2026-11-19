const getCompletedModules = (progress, course) => {
    const validIds = new Set((course.modules || []).map((module) => String(module._id)));
    return (progress?.completedModules || [])
        .map(String)
        .filter((moduleId) => validIds.has(moduleId));
};

const isCourseComplete = (progress, course) => {
    const total = (course.modules || []).length;
    return total > 0 && getCompletedModules(progress, course).length === total;
};

module.exports = { getCompletedModules, isCourseComplete };
