import { Router } from "express";
import { crearAnimal, getAnimalPorId, getAnimales, actualizarAnimal, eliminarAnimal } from "../controllers/animales.controller.js"; 
import upload from "../middleware/upload.js";

const router = Router();

router.get("/", getAnimales);
// Multer al medio para que intercepte hasta 5 archivos
router.post("/", upload.array('fotos', 5), crearAnimal); 
router.get("/:id", getAnimalPorId);
router.patch("/:id", actualizarAnimal);
router.delete("/:id", eliminarAnimal);

export default router;
