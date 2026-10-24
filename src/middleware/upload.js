import multer from "multer";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const directorioSrc = path.dirname(fileURLToPath(import.meta.url));
export const directorioUploads = path.resolve(directorioSrc, "../../uploads");

const extensiones = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };
const MAX_FOTOS = 5;

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, directorioUploads),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${randomUUID()}${extensiones[file.mimetype]}`),
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024, files: MAX_FOTOS },
    fileFilter: (req, file, cb) => {
        if (file.mimetype in extensiones) return cb(null, true);
        const error = new Error("Solo se permiten imágenes JPG, PNG o WebP");
        error.codigo = "TIPO_INVALIDO";
        return cb(error);
    },
});

/** Middleware para las rutas: sube hasta 5 fotos del campo "fotos" y responde 400/413 si algo falla. */
export const subirFotos = (req, res, next) => {
    upload.array("fotos", MAX_FOTOS)(req, res, (error) => {
        if (!error) return next();

        let estado = 400;
        let mensaje = error.message;

        if (error.code === "LIMIT_FILE_SIZE") {
            estado = 413;
            mensaje = "Cada foto puede pesar hasta 5 MB";
        } else if (error.code === "LIMIT_FILE_COUNT" || error.code === "LIMIT_UNEXPECTED_FILE") {
            mensaje = `Puedes subir hasta ${MAX_FOTOS} fotos`;
        } else if (error.codigo !== "TIPO_INVALIDO") {
            // Error que no es de multer: que lo maneje el manejador global
            return next(error);
        }

        return res.status(estado).json({ success: false, error: { message: mensaje } });
    });
};

export default upload;