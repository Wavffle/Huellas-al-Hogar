import { Router } from "express";
import {crearSolicitud,getSolicitudes,getSolicitudPorId,actualizarSolicitud,eliminarSolicitud} from "../controllers/solicitudesAdoptar.controller.js";

const router = Router();

router.get("/", getSolicitudes);
router.post("/", crearSolicitud);
router.get("/:id", getSolicitudPorId);
router.patch("/:id", actualizarSolicitud);
router.delete("/:id", eliminarSolicitud);
export default router;