import { pool } from "../config/database.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//---------------------------------------------------------------------------------------------------//
// funciones auxiliares que las otras usen, la idea es hacerlo con tokens esas jwt //

function esObjetoJson(body) {
  return body !== null && typeof body === "object" && !Array.isArray(body);
}

function obtenerSecretoJwt() {
  const secreto = process.env.JWT_SECRET;

  if (!secreto || secreto.length < 32) {
    throw new Error("JWT_SECRET no está configurado correctamente");
  }

  return secreto;
}

function obtenerUsuarioPublico(usuario) {
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    correo: usuario.correo,
    rol: usuario.rol,
  };
}

function crearToken(usuario, secreto, recordar = false) {
  return jwt.sign(
      {
        sub: String(usuario.id),
        rol: usuario.rol,
        rec: recordar,
      },
      secreto,
      { expiresIn: recordar ? "30d" : process.env.JWT_EXPIRES_IN || "8h" }
  );
}

//---------------------------------------------------------------------------------------------------//
// POST /api/auth/registro, son registrarUsuario y el de iniciar sesion, el de registrar revisa que no se repiten ids 
// y que se rellenen todos los necesarios, tambien que cumpla bien las reglas obvio

export const registrarUsuario = async (req, res, next) => {
  if (!esObjetoJson(req.body)) {
    return res.status(400).json({
      success: false,
      error: { message: "El cuerpo debe ser un objeto JSON" },
    });
  }

  const nombre =
    typeof req.body.nombre === "string" ? req.body.nombre.trim() : "";
  const correo =
    typeof req.body.correo === "string"
      ? req.body.correo.trim().toLowerCase()
      : "";
  const password = req.body.password;

  if (!nombre || nombre.length > 100) {
    return res.status(400).json({
      success: false,
      error: {
        message: "nombre es obligatorio y debe tener hasta 100 caracteres",
      },
    });
  }

  if (
    !correo ||
    correo.length > 150 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)
  ) {
    return res.status(400).json({
      success: false,
      error: { message: "El correo electrónico no es válido" },
    });
  }

  if (
    typeof password !== "string" ||
    password.length < 8 ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    return res.status(400).json({
      success: false,
      error: {
        message:
          "La contraseña debe tener al menos 8 caracteres",
      },
    });
  }

  try {
    // Se comprueba la configuración antes de insertar para no crear una cuenta
    // si luego no se puede emitir su token.
    const secreto = obtenerSecretoJwt();

    const existente = await pool.query(
      "SELECT id FROM usuarios WHERE LOWER(correo) = $1",
      [correo]
    );

    if (existente.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: { message: "Ya existe una cuenta con ese correo" },
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // El rol se asigna en el servidor; no se acepta desde el formulario.
    const { rows } = await pool.query(
      `INSERT INTO usuarios (correo, password_hash, nombre, rol)
       VALUES ($1, $2, $3, $4)
       RETURNING id, correo, nombre, rol`,
      [correo, passwordHash, nombre, "ADOPTANTE"]
    );

    const usuario = rows[0];
    const token = crearToken(usuario, secreto);

    return res.status(201).json({
      success: true,
      message: "Cuenta creada correctamente",
      data: {
        token,
        usuario: obtenerUsuarioPublico(usuario),
      },
    });
  } catch (error) {
    // Cubre el caso en que dos registros con el mismo correo ocurran a la vez.
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        error: { message: "Ya existe una cuenta con ese correo" },
      });
    }

    return next(error);
  }
};

//---------------------------------------------------------------------------------------------------//
// POST /api/auth/login este el de iniciar sesion pide los obligatoros y verifica que exista en base de datos //

export const iniciarSesion = async (req, res, next) => {
  if (!esObjetoJson(req.body)) {
    return res.status(400).json({
      success: false,
      error: { message: "El cuerpo debe ser un objeto JSON" },
    });
  }

  const correo =
    typeof req.body.correo === "string"
      ? req.body.correo.trim().toLowerCase()
      : "";
  const password = req.body.password;

  if (!correo || typeof password !== "string" || !password) {
    return res.status(400).json({
      success: false,
      error: { message: "correo y password son obligatorios" },
    });
  }

  try {
    const { rows } = await pool.query(
      `SELECT id, correo, nombre, rol, password_hash
       FROM usuarios
       WHERE LOWER(correo) = $1`,
      [correo]
    );

    const usuario = rows[0];

    // Se usa el mismo error para correo inexistente y contraseña incorrecta. esto se puede cambiar despues si eso
    if (!usuario || !(await bcrypt.compare(password, usuario.password_hash))) {
      return res.status(401).json({
        success: false,
        error: { message: "Correo o contraseña incorrectos" },
      });
    }

    const secreto = obtenerSecretoJwt();
    const recordar = req.body.recordar === true;
    const token = crearToken(usuario, secreto, recordar);

    return res.status(200).json({
      success: true,
      message: "Inicio de sesión correcto",
      data: {
        token,
        usuario: obtenerUsuarioPublico(usuario),
      },
    });
  } catch (error) {
    return next(error);
  }
};

//---------------------------------------------------------------------------------------------------//
// POST /api/auth/renovar: entrega un token nuevo y el rol vigente según la base de datos.
// Así, si un admin cambia el rol de alguien, el cambio se ve sin volver a iniciar sesión.

export const renovarSesion = async (req, res, next) => {
  try {
    const secreto = obtenerSecretoJwt();

    const { rows } = await pool.query(
        "SELECT id, correo, nombre, rol FROM usuarios WHERE id = $1",
        [req.usuario.id]
    );
    const usuario = rows[0];

    if (!usuario) {
      return res.status(401).json({
        success: false,
        error: { message: "La cuenta ya no existe" },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Sesión renovada",
      data: {
        token: crearToken(usuario, secreto, req.usuario.recordar),
        usuario: obtenerUsuarioPublico(usuario),
      },
    });
  } catch (error) {
    return next(error);
  }
};