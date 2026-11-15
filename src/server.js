import usuariosRoutes from "./routes/usuarios.routes.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { pool } from "./config/database.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ErrorHttp } from "./utils/errores.js";

import animalesroute from "./routes/animales.routes.js";
import solicitudesRoutes from "./routes/solicitudes.routes.js";
import contenidosEducativosRoutes from "./routes/educativos.routes.js";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const directorioSrc = path.dirname(fileURLToPath(import.meta.url));
const directorioUploads = path.resolve(directorioSrc, "../uploads");

// Permite que el frontend (puerto 5173) cargue imágenes estáticas del backend (puerto 3000)
app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
);

// CORS_ORIGIN="http://localhost:5173,https://mi-dominio.cl". Si no existe, solo se permite el frontend local.
const origenesPermitidos = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
    : ["http://localhost:5173"];

app.use(
    cors({
      origin: origenesPermitidos,
      allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.use(express.json());
app.use("/uploads", express.static(directorioUploads));

// Rutas API
app.use("/api/animales", animalesroute);
app.use("/api/solicitudes", solicitudesRoutes);
app.use("/api/contenidos-educativos", contenidosEducativosRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuariosRoutes);

// Ruta principal
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Bienvenido a la API de Huellas al Hogar",
  });
});

// Comprobación de salud del backend
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    data: { status: "OK", service: "Huellas al Hogar API" },
  });
});

// Comprobación de conexión a PostgreSQL
app.get("/api/health/database", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    return res.status(200).json({
      success: true,
      data: { status: "OK", database: "conectada" },
    });
  } catch (error) {
    console.error(
        "No se pudo comprobar la conexión con PostgreSQL:",
        error.code || error.message
    );
    return res.status(503).json({
      success: false,
      error: { message: "La base de datos no está disponible" },
    });
  }
});

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { message: "Ruta no encontrada" },
  });
});

// Manejador global de errores
app.use((error, req, res, next) => {
  // Si ya comenzó la respuesta, Express debe continuar con su manejo interno.
  if (res.headersSent) return next(error);

  // Errores esperados lanzados por los servicios (validación, permisos, no encontrado, conflicto):
  // se responden tal cual, con su mensaje y campos extra, y no se registran como fallos.
  if (error instanceof ErrorHttp) {
    return res.status(error.status).json({
      success: false,
      error: { message: error.message, ...error.extra },
    });
  }

  console.error("Error inesperado en la API:", error);

  let estado = Number(error?.status || error?.statusCode);
  if (!Number.isInteger(estado) || estado < 400 || estado > 599) estado = 500;

  let mensaje =
      estado >= 500
          ? "Error interno del servidor"
          : "No se pudo procesar la solicitud";

  if (error?.type === "entity.parse.failed") {
    estado = 400;
    mensaje = "El JSON enviado no tiene un formato válido";
  }

  if (error?.type === "entity.too.large") {
    estado = 413;
    mensaje = "El cuerpo de la solicitud es demasiado grande";
  }

  return res.status(estado).json({
    success: false,
    error: { message: mensaje },
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});