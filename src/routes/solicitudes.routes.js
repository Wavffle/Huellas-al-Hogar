import { Router } from "express";
import {crearSolicitud,getSolicitudes,getSolicitudPorId,actualizarSolicitud,eliminarSolicitud} from "../controllers/solicitudesAdoptar.controller.js";
import {verificarToken,permitirRoles,} from "../middleware/auth.middleware.js";
const router = Router();

router.get("/", verificarToken, getSolicitudes);
router.post("/", verificarToken, permitirRoles("ADOPTANTE"), crearSolicitud);
router.get("/:id", verificarToken, getSolicitudPorId);
router.patch("/:id", verificarToken, permitirRoles("RESCATISTA", "ADMIN"), actualizarSolicitud);
router.delete("/:id", verificarToken, permitirRoles("ADMIN"), eliminarSolicitud);
export default router;