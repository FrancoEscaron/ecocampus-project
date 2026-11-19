const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");

const app = express();
app.disable("x-powered-by");

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

if (!MONGODB_URI || !JWT_SECRET) {
    console.error("Faltan variables de entorno obligatorias: MONGODB_URI y JWT_SECRET.");
    process.exit(1);
}

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

const configuredOrigins = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const isLocalOrigin = (origin) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (configuredOrigins.includes(origin)) return callback(null, true);
        if (process.env.NODE_ENV !== "production" && isLocalOrigin(origin)) return callback(null, true);
        return callback(new Error("Origen no permitido por CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 600
}));

app.use(express.json({ limit: "1mb" }));

app.use("/uploads", express.static(path.join(__dirname, "uploads"), {
    setHeaders: (res) => {
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    }
}));

const Action = require("./models/action-schema");
const { ACTION_CATALOG, migrateActionTaxonomy } = require("./utils/actionCatalog");

const seedActions = async () => {
    const collectionExists = await mongoose.connection.db
        .listCollections({ name: Action.collection.name }, { nameOnly: true })
        .hasNext();

    await Action.init();

    if (collectionExists) return;

    const actions = Object.entries(ACTION_CATALOG).map(([key, action]) => ({ key, ...action }));
    await Action.insertMany(actions);
    console.log("Catálogo de acciones inicializado");
};

const conectarDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Base de datos conectada");
        try {
            const Form = require("./models/form-schema");
            await Form.syncIndexes();
            console.log("Índices del formulario sincronizados");
        } catch (indexError) {
            console.error("No se pudieron sincronizar los índices del formulario:", indexError.message);
        }
        try {
            await seedActions();
            await migrateActionTaxonomy(Action);
        } catch (seedError) {
            console.error("No se pudo inicializar el catálogo de acciones:", seedError.message);
        }
    } catch (error) {
        console.error("Error conectando MongoDB:", error.message);
        process.exit(1);
    }
};

const formRoutes = require("./routes/formRoutes");
const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const actionRoutes = require("./routes/actionRoutes");
const faqRoutes = require("./routes/faqRoutes");
const adminRoutes = require("./routes/adminRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const impactRoutes = require("./routes/impactRoutes");
const certificateRoutes = require("./routes/certificateRoutes");

app.use("/api", formRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/actions", actionRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/impact", impactRoutes);
app.use("/api/certificates", certificateRoutes);

app.use((req, res) => {
    res.status(404).json({ success: false, message: "Recurso no encontrado." });
});

app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);

    if (err.message === "Origen no permitido por CORS") {
        return res.status(403).json({ success: false, message: err.message });
    }

    if (err.type === "entity.too.large") {
        return res.status(413).json({ success: false, message: "La solicitud es demasiado grande." });
    }

    if (err.name === "ValidationError") {
        return res.status(400).json({ success: false, message: "Datos inválidos.", errors: Object.keys(err.errors || {}) });
    }

    if (err.name === "CastError") {
        return res.status(400).json({ success: false, message: "Identificador inválido." });
    }

    if (err.code === 11000) {
        return res.status(409).json({ success: false, message: "El registro ya existe." });
    }

    console.error(err);
    res.status(err.status || 500).json({ success: false, message: "Error interno del servidor." });
});

conectarDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
});
