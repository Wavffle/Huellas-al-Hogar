import multer from "multer";
import fs from "node:fs/promises";
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
    // Primer filtro, barato: el tipo que declara el cliente. Se puede falsear, por eso
    // después se comprueba el contenido real del archivo (verificarContenido).
    fileFilter: (req, file, cb) => {
        if (file.mimetype in extensiones) return cb(null, true);
        const error = new Error("Solo se permiten imágenes JPG, PNG o WebP");
        error.codigo = "TIPO_INVALIDO";
        return cb(error);
    },
});

//---------------------------------------------------------------------------------------------------//
// Validación por contenido (magic bytes)
//---------------------------------------------------------------------------------------------------//

const FIRMA_PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/** Lee los primeros bytes del archivo y devuelve su tipo real, o null si no es JPG, PNG ni WebP. */
async function detectarTipoReal(ruta) {
    const archivo = await fs.open(ruta, "r");
    try {
        const cabecera = Buffer.alloc(12);
        const { bytesRead } = await archivo.read(cabecera, 0, 12, 0);

        // JPEG: FF D8 FF
        if (bytesRead >= 3 && cabecera[0] === 0xff && cabecera[1] === 0xd8 && cabecera[2] === 0xff) return "image/jpeg";
        // PNG: 89 50 4E 47 0D 0A 1A 0A
        if (bytesRead >= 8 && cabecera.subarray(0, 8).equals(FIRMA_PNG)) return "image/png";
        // WebP: "RIFF" + 4 bytes de tamaño + "WEBP"
        if (bytesRead >= 12 && cabecera.toString("ascii", 0, 4) === "RIFF" && cabecera.toString("ascii", 8, 12) === "WEBP") {
            return "image/webp";
        }
        return null;
    } finally {
        await archivo.close();
    }
}

class ContenidoInvalido extends Error {}

/**
 * Comprueba que cada archivo subido sea realmente una imagen JPG, PNG o WebP.
 * - Si alguno no lo es, se borran TODOS los archivos de la petición y se responde 400.
 * - Si el contenido es válido pero no coincide con lo declarado (por ejemplo un WebP guardado
 *   como .jpg), el archivo se renombra con su extensión real.
 */
async function verificarContenido(req, res, next) {
    const archivos = req.files ?? [];

    try {
        for (const archivo of archivos) {
            const real = await detectarTipoReal(archivo.path);
            if (!real) throw new ContenidoInvalido();

            if (real !== archivo.mimetype) {
                const nombre = `${path.parse(archivo.filename).name}${extensiones[real]}`;
                const ruta = path.join(directorioUploads, nombre);
                await fs.rename(archivo.path, ruta);
                archivo.filename = nombre;
                archivo.path = ruta;
                archivo.mimetype = real;
            }
        }
        return next();
    } catch (error) {
        await Promise.all(archivos.map((f) => fs.unlink(f.path).catch(() => {})));

        if (error instanceof ContenidoInvalido) {
            return res.status(400).json({
                success: false,
                error: { message: "El contenido de uno de los archivos no es una imagen JPG, PNG o WebP válida" },
            });
        }
        // Error del sistema de archivos: que lo maneje el manejador global
        return next(error);
    }
}

//---------------------------------------------------------------------------------------------------//

/** Middleware para las rutas: sube hasta 5 fotos del campo "fotos", valida su contenido y responde 400/413 si algo falla. */
export const subirFotos = (req, res, next) => {
    upload.array("fotos", MAX_FOTOS)(req, res, (error) => {
        if (!error) return verificarContenido(req, res, next);

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