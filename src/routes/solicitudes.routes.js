import { Router } from "express";
import {crearSolicitud,getSolicitudes,getSolicitudPorId,actualizarSolicitud,} from "../controllers/solicitudesAdoptar.controller.js";

const router = Router();

router.get("/", getSolicitudes);
router.post("/", crearSolicitud);
router.get("/:id", getSolicitudPorId);
router.patch("/:id", actualizarSolicitud);

export default router;