
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import animalesroute from "./routes/animales.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors()); // Configuración temporal para desarrollo
app.use(express.json());

app.use("/api/animales", animalesroute);

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

// Manejo de rutas inexistentes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: "Ruta no encontrada",
    },
  });
});



// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
