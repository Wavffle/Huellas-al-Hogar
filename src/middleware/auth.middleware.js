import jwt from "jsonwebtoken";
import { pool } from "../config/database.js";

// Verifica el JWT y carga el usuario autenticado en req.usuario.
// El rol NO se toma del token: se lee de la base en cada petición, así un cambio de rol
// (o una cuenta eliminada) se aplica de inmediato y no hay que esperar a que el token venza.

const ROLES = ["ADMIN", "RESCATISTA", "ADOPTANTE"];

/** Rol actual del usuario según la base de datos, o null si la cuenta ya no existe. */
async function obtenerRolVigente(id) {
  const { rows } = await pool.query("SELECT rol FROM usuarios WHERE id = $1", [id]);
  return rows[0]?.rol ?? null;
}

//---------------------------------------------------------------------------------------------------//

export async function verificarToken(req, res, next) {
  const encabezado = req.headers.authorization;
  const coincidencia = encabezado?.match(/^Bearer\s+(.+)$/i);

  if (!coincidencia) {
    return res.status(401).json({
      success: false,
      error: { message: "Se requiere un token de acceso" },
    });
  }

  const secreto = process.env.JWT_SECRET;

  if (!secreto || secreto.length < 32) {
    return res.status(500).json({
      success: false,
      error: { message: "La autenticación no está configurada correctamente" },
    });
  }

  let payload;
  try {
    payload = jwt.verify(coincidencia[1], secreto);
  } catch {
    return res.status(401).json({
      success: false,
      error: { message: "El token expiró o no es válido" },
    });
  }

  const id = typeof payload === "object" ? Number(payload?.sub) : NaN;

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(401).json({
      success: false,
      error: { message: "El token no es válido" },
    });
  }

  // Si la base falla, es un error del servidor (500), no un problema del token
  let rol;
  try {
    rol = await obtenerRolVigente(id);
  } catch (error) {
    return next(error);
  }

  if (!rol) {
    return res.status(401).json({
      success: false,
      error: { message: "La cuenta ya no existe" },
    });
  }

  req.usuario = { id, rol, recordar: payload.rec === true };
  return next();
}

//---------------------------------------------------------------------------------------------------//
// Permite continuar solo a los roles indicados
//---------------------------------------------------------------------------------------------------//
export function permitirRoles(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        success: false,
        error: { message: "Debes iniciar sesión" },
      });
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        error: { message: "No tienes permiso para realizar esta operación" },
      });
    }

    return next();
  };
}

//---------------------------------------------------------------------------------------------------//
// Igual que verificarToken, pero sin exigir sesión: si hay un token válido y la cuenta existe,
// carga req.usuario (con el rol vigente); si no hay token, no sirve o la cuenta ya no existe,
// la petición sigue como anónima.

export async function verificarTokenOpcional(req, res, next) {
  const coincidencia = req.headers.authorization?.match(/^Bearer\s+(.+)$/i);
  const secreto = process.env.JWT_SECRET;

  if (!coincidencia || !secreto) return next();

  let payload;
  try {
    payload = jwt.verify(coincidencia[1], secreto);
  } catch {
    // Token vencido o inválido: se trata como visitante
    return next();
  }

  const id = Number(payload?.sub);
  if (!Number.isInteger(id) || id <= 0) return next();

  try {
    const rol = await obtenerRolVigente(id);
    if (rol && ROLES.includes(rol)) {
      req.usuario = { id, rol, recordar: payload.rec === true };
    }
  } catch (error) {
    return next(error);
  }

  return next();
}