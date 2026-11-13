const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const multer = require("multer");

const uploadDir = path.join(__dirname, "..", "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const imageTypes = ["image/jpeg", "image/png", "image/webp"];
const imageExtensions = [".jpg", ".jpeg", ".png", ".webp"];
const evidenceTypes = [...imageTypes, "application/pdf"];
const evidenceExtensions = [...imageExtensions, ".pdf"];
const maxFileSize = 5 * 1024 * 1024;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();
        cb(null, `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${extension}`);
    }
});

const createUploader = (allowedTypes, allowedExtensions, formatMessage) => multer({
    storage,
    limits: { fileSize: maxFileSize, files: 1 },
    fileFilter: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();
        if (!allowedTypes.includes(file.mimetype) || !allowedExtensions.includes(extension)) {
            return cb(new Error(formatMessage));
        }
        cb(null, true);
    }
});

const imageUploader = createUploader(
    imageTypes,
    imageExtensions,
    "Formato no permitido. Subí una imagen JPG, PNG o WebP."
);

const evidenceUploader = createUploader(
    evidenceTypes,
    evidenceExtensions,
    "Formato no permitido. Subí una imagen JPG, PNG o WebP o un PDF."
);

const uploadSingle = (uploader, fieldName) => (req, res, next) => {
    uploader.single(fieldName)(req, res, (error) => {
        if (!error) return next();
        const message = error.code === "LIMIT_FILE_SIZE"
            ? "El archivo supera el límite de 5 MB."
            : error.message || "No se pudo subir el archivo.";
        res.status(400).json({ success: false, message });
    });
};

const uploadCourseImage = uploadSingle(imageUploader, "image");
const uploadActionImage = uploadSingle(imageUploader, "image");
const uploadEvidence = uploadSingle(evidenceUploader, "evidence");

const removeUploadedFile = (file) => {
    if (!file) return;
    fs.unlink(file.path, () => {});
};

const removeStoredFile = (filePath) => {
    if (typeof filePath !== "string" || !filePath.startsWith("/uploads/")) return;
    const filename = path.basename(filePath);
    fs.unlink(path.join(uploadDir, filename), () => {});
};

module.exports = {
    uploadDir,
    uploadCourseImage,
    uploadActionImage,
    uploadEvidence,
    removeUploadedFile,
    removeStoredFile
};
