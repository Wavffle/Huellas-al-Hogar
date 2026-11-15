import { Router } from "express";
import { getBloques } from "../controllers/bloques.controller.js";

const router = Router();

// Público y de solo lectura: es el contenido de las páginas informativas del sitio
router.get("/", getBloques);

export default router;
