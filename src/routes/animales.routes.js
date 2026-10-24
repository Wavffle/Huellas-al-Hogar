import { Router } from "express";
import {
    crearAnimal, getAnimalPorId, getAnimales, getMisAnimales, actualizarAnimal, eliminarAnimal,
} from "../controllers/animales.controller.js";
import { verificarToken, verificarTokenOpcional, permitirRoles } from "../middleware/auth.middleware.js";
import { subirFotos } from "../middleware/upload.js";

const router = Router();

router.get("/", getAnimales);
router.get("/mios", verificarToken, permitirRoles("RESCATISTA", "ADMIN"), getMisAnimales);
router.get("/:id", verificarTokenOpcional, getAnimalPorId);
router.post("/", verificarToken, permitirRoles("RESCATISTA", "ADMIN"), subirFotos, crearAnimal);
router.patch("/:id", verificarToken, permitirRoles("RESCATISTA", "ADMIN"), subirFotos, actualizarAnimal);
router.delete("/:id", verificarToken, permitirRoles("RESCATISTA", "ADMIN"), eliminarAnimal);

export default router;