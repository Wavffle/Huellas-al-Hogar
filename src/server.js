
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

//estos son rutas
import animalesroute from "./routes/animales.routes.js";
import solicitudesRoutes from "./routes/solicitudes.routes.js";
import contenidosEducativosRoutes from "./routes/educativos.routes.js";
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
