import { Router } from "express";
import { registrarUsuario, iniciarSesion, renovarSesion } from "../controllers/auth.controller.js";
import { verificarToken } from "../middleware/auth.middleware.js";
import { limitarIntentos } from "../middleware/limitarIntentos.js";

const router = Router();
const limiteLogin = limitarIntentos({ max: 20 });

router.post("/registro", limiteLogin, registrarUsuario);
router.post("/login", limiteLogin, iniciarSesion);
router.post("/renovar", verificarToken, renovarSesion);

export default router;