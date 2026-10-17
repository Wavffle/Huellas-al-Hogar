import { Router } from "express";
import {crearContenidoEducativo,getContenidosEducativos,getContenidoEducativoPorId,actualizarContenidoEducativo,eliminarContenidoEducativo,} from "../controllers/educativos.controller.js";

const router = Router();

router.get("/", getContenidosEducativos);
router.post("/", crearContenidoEducativo);
router.get("/:id", getContenidoEducativoPorId);
router.patch("/:id", actualizarContenidoEducativo);
router.delete("/:id", eliminarContenidoEducativo);

export default router;