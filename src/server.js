import usuariosRoutes from "./routes/usuarios.routes.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { pool } from "./config/database.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

import animalesroute from "./routes/animales.routes.js";
import solicitudesRoutes from "./routes/solicitudes.routes.js";
import contenidosEducativosRoutes from "./routes/educativos.routes.js";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const directorioSrc = path.dirname(fileURLToPath(import.meta.url));
const directorioUploads = path.resolve(directorioSrc, "../uploads");

//Permite que el frontend (puerto 5173) cargue imágenes estáticas del backend (puerto 3000)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

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
  if (res.headersSent) return next(error);
  console.error("Error inesperado en la API:", error);

  let estado = Number(error?.status || error?.statusCode);
  if (!Number.isInteger(estado) || estado < 400 || estado > 599) estado = 500;

  return res.status(estado).json({
    success: false,
    error: {
      message: estado >= 500 ? "Error interno del servidor" : "No se pudo procesar la solicitud",
    },
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
