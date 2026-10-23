import { Router } from "express";
import { crearAnimal, getAnimalPorId, getAnimales, actualizarAnimal, eliminarAnimal } from "../controllers/animales.controller.js"; 
import {verificarToken,permitirRoles } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.js";

const router = Router();

router.get("/", getAnimales);
// Multer al medio para que intercepte hasta 5 archivos
router.post("/",verificarToken,permitirRoles("RESCATISTA", "ADMIN"), upload.array('fotos', 5), crearAnimal); 
router.get("/:id", getAnimalPorId);
router.patch("/:id",verificarToken,permitirRoles("RESCATISTA", "ADMIN"), actualizarAnimal);
router.delete("/:id",verificarToken,permitirRoles("RESCATISTA", "ADMIN"), eliminarAnimal);

export default router;
