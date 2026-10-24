import { Router } from "express";
import {crearContenidoEducativo,getContenidosEducativos,getContenidoEducativoPorId,actualizarContenidoEducativo,eliminarContenidoEducativo,} from "../controllers/educativos.controller.js";
import { verificarToken, permitirRoles } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", getContenidosEducativos);
router.post("/", verificarToken, permitirRoles("ADMIN"), crearContenidoEducativo);
router.get("/:id", getContenidoEducativoPorId);
router.patch("/:id", verificarToken, permitirRoles("ADMIN"), actualizarContenidoEducativo);
router.delete("/:id", verificarToken, permitirRoles("ADMIN"), eliminarContenidoEducativo);

export default router;