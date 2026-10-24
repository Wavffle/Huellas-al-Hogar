import { Router } from "express";
import { registrarUsuario, iniciarSesion, renovarSesion } from "../controllers/auth.controller.js";
import { verificarToken } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/registro", registrarUsuario);
router.post("/login", iniciarSesion);
router.post("/renovar", verificarToken, renovarSesion);

export default router;