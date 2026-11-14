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

// Middlewares de Seguridad
app.use(helmet()); // Esto protege cabeceras http contra amenazas como xss

const origenesPermitidos = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
    : ["http://localhost:5173"];

app.use(cors({
  origin: origenesPermitidos,
  allowedHeaders: ["Content-Type", "Authorization"] // Restringe cabeceras permitidas
}));

app.use(express.json());
app.use("/uploads", express.static(directorioUploads));

// Rutas
app.use("/api/animales", animalesroute);
app.use("/api/solicitudes", solicitudesRoutes);
app.use("/api/contenidos-educativos", contenidosEducativosRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuariosRoutes);
