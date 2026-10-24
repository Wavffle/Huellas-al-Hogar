import { pool } from "../config/database.js";

const rolesValidos = ["ADMIN", "RESCATISTA", "ADOPTANTE"];

// GET /api/usuarios?q=texto : lista de usuarios (solo ADMIN), con buscador por nombre o correo
export const listarUsuarios = async (req, res, next) => {
    try {
        const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
        const valores = [];
        let filtro = "";

        if (q) {
            valores.push(`%${q}%`);
            filtro = "WHERE u.nombre ILIKE $1 OR u.correo ILIKE $1";
        }

        const { rows } = await pool.query(
            `SELECT u.id, u.nombre, u.correo, u.rol, u.creado_en,
              (SELECT COUNT(*)::int FROM animales a WHERE a.usuario_id = u.id) AS publicaciones
       FROM usuarios u
       ${filtro}
       ORDER BY u.id`,
            valores
        );

        return res.status(200).json({ success: true, message: "Usuarios obtenidos", data: rows });
    } catch (error) {
        return next(error);
    }
};

// PATCH /api/usuarios/:id/rol  { "rol": "RESCATISTA" } (solo ADMIN)
export const cambiarRol = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ success: false, error: { message: "El id debe ser un número entero positivo" } });
        }

        const rol = req.body?.rol;
        if (!rolesValidos.includes(rol)) {
            return res.status(400).json({
                success: false,
                error: { message: "El rol no es válido", allowedValues: rolesValidos },
            });
        }

        // Evita que el último admin se quite el acceso por accidente
        if (id === req.usuario.id) {
            return res.status(409).json({
                success: false,
                error: { message: "No puedes cambiar tu propio rol" },
            });
        }

        const { rows } = await pool.query(
            "UPDATE usuarios SET rol = $1 WHERE id = $2 RETURNING id, nombre, correo, rol",
            [rol, id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, error: { message: "Usuario no encontrado" } });
        }

        return res.status(200).json({ success: true, message: "Rol actualizado", data: rows[0] });
    } catch (error) {
        return next(error);
    }
};