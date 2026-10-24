import { Router } from "express";
import { listarUsuarios, cambiarRol } from "../controllers/usuarios.controller.js";
import { verificarToken, permitirRoles } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", verificarToken, permitirRoles("ADMIN"), listarUsuarios);
router.patch("/:id/rol", verificarToken, permitirRoles("ADMIN"), cambiarRol);

export default router;