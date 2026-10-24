import jwt from "jsonwebtoken";

// Verifica el JWT y carga el usuario autenticado en req.usuario
//por ahora es bastante simple con los 3 roles, y la logica de la funcion es igual de simple, verifica token buscando "coincidencia" en el

export function verificarToken(req, res, next) {
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

  try {
    const payload = jwt.verify(coincidencia[1], secreto);

    if (
      typeof payload !== "object" ||
      !payload.sub ||
      !["ADMIN", "RESCATISTA", "ADOPTANTE"].includes(payload.rol)
    ) {
      return res.status(401).json({
        success: false,
        error: { message: "El token no es válido" },
      });
    }

    req.usuario = {
      id: Number(payload.sub),
      rol: payload.rol,
      recordar: payload.rec === true,
    };

    if (!Number.isInteger(req.usuario.id) || req.usuario.id <= 0) {
      return res.status(401).json({
        success: false,
        error: { message: "El token no es válido" },
      });
    }

    return next();
  } catch {
    return res.status(401).json({
      success: false,
      error: { message: "El token expiró o no es válido" },
    });
  }
}

//---------------------------------------------------------------------------------------------------//


// Permite continuar solo a los roles indicados, de nuevo el ...para no copiarlo todo
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