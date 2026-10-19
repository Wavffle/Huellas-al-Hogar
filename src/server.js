
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./config/database.js";

//estos son rutas
import animalesroute from "./routes/animales.routes.js";
import solicitudesRoutes from "./routes/solicitudes.routes.js";
import contenidosEducativosRoutes from "./routes/educativos.routes.js";
import authRoutes from "./routes/auth.routes.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;


// Middlewares
app.use(cors()); // Configuración temporal para desarrollo
app.use(express.json());

// de ruta especificamente
app.use("/api/animales", animalesroute);
app.use("/api/solicitudes", solicitudesRoutes);
app.use("/api/contenidos-educativos", contenidosEducativosRoutes);
app.use("/api/auth", authRoutes);

// Ruta principal
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Bienvenido a la API de Huellas al Hogar",
  });
});

// Ruta para comprobar el estado del servidor
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: "OK",
      service: "Huellas al Hogar API",
    },
  });
});

// Ruta para comprobar que el backend también puede consultar PostgreSQL.
app.get("/api/health/database", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    return res.status(200).json({
      success: true,
      data: {
        status: "OK",
        database: "conectada",
      },
    });
  } catch (error) {
    console.error(
      "No se pudo comprobar la conexión con PostgreSQL:",
      error.code || error.message
    );

    return res.status(503).json({
      success: false,
      error: {
        message: "La base de datos no está disponible",
      },
    });
  }
});

// Manejo de rutas inexistentes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: "Ruta no encontrada",
    },
  });
});

//---------------------------------------------------------------------------------------------------//

// manejo de errores inesperados, porsiacaso nomas //

app.use((error, req, res, next) => {
  // Si ya comenzó la respuesta, Express debe continuar con su manejo interno.
  if (res.headersSent) {
    return next(error);
  }

  console.error("Error inesperado en la API:", error);

  let estado = Number(error?.status || error?.statusCode);

  if (!Number.isInteger(estado) || estado < 400 || estado > 599) {
    estado = 500;
  }

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
    error: {
      message: mensaje,
    },
  });
});

//---------------------------------------------------------------------------------------------------//

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
