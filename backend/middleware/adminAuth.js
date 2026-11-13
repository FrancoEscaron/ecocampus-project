const jwt = require("jsonwebtoken");
const User = require("../models/user-schema");

const requireAuth = async (req, res, next) => {
    try {
        const header = req.headers.authorization || "";
        if (!header.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "No autorizado. Falta el token de sesión." });
        }

        const token = header.slice(7).trim();
        if (!token) {
            return res.status(401).json({ success: false, message: "No autorizado. Falta el token de sesión." });
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(payload.id).select("_id name lastName email role ecoPoints coursesOwned");

        if (!user) {
            return res.status(401).json({ success: false, message: "Sesión inválida." });
        }

        req.authUser = user;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
            return res.status(401).json({ success: false, message: "Sesión inválida o vencida." });
        }
        next(error);
    }
};

const requireAdmin = (req, res, next) => {
    if (!req.authUser || req.authUser.role !== "admin") {
        return res.status(403).json({ success: false, message: "Acceso denegado. Se requieren privilegios de administrador." });
    }
    next();
};

module.exports = { requireAuth, requireAdmin };
