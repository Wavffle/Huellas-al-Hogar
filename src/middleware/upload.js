import multer from "multer";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const directorioSrc = path.dirname(fileURLToPath(import.meta.url));
const directorioUploads = path.resolve(directorioSrc, "../../uploads");

const extensiones = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, directorioUploads),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${randomUUID()}${extensiones[file.mimetype]}`),
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024, files: 5 },
    fileFilter: (req, file, cb) => cb(null, file.mimetype in extensiones),
});

export default upload;