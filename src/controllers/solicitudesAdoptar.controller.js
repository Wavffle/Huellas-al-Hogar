import { pool } from "../config/database.js";
//---------------------------------------------------------------------------------------------------//
// funciones auxiliares, para testeo y pre base de datos //

const estadosPermitidos = [
  "PENDIENTE",
  "APROBADA",
  "RECHAZADA",
];

const transicionesPermitidas = {
  PENDIENTE: ["APROBADA", "RECHAZADA"],
};

function esObjetoJson(body) {
  return body !== null && typeof body === "object" && !Array.isArray(body);
}

function obtenerIdValido(idParametro) {
  const id = Number(idParametro);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

//---------------------------------------------------------------------------------------------------//
// parte para GET de las solicitudes //

export const getSolicitudes = async (req, res, next) => {
  try {
    const { animal_id, usuario_id, estado } = req.query;
    const condiciones = [];
    const valores = [];

    if (animal_id !== undefined) {
      const animalIdBuscado = obtenerIdValido(animal_id);

      if (animalIdBuscado === null) {
        return res.status(400).json({
          success: false,
          error: {
            message: "animal_id debe ser un número entero positivo",
          },
        });
      }

      valores.push(animalIdBuscado);
      condiciones.push(`animal_id = $${valores.length}`);
    }

    if (usuario_id !== undefined) {
      const usuarioIdBuscado = obtenerIdValido(usuario_id);

      if (usuarioIdBuscado === null) {
        return res.status(400).json({
          success: false,
          error: {
            message: "usuario_id debe ser un número entero positivo",
          },
        });
      }

      valores.push(usuarioIdBuscado);
      condiciones.push(`usuario_id = $${valores.length}`);
    }

    if (estado !== undefined) {
      if (!estadosPermitidos.includes(estado)) {
        return res.status(400).json({
          success: false,
          error: {
            message: "El estado de la solicitud no es válido",
            allowedValues: estadosPermitidos,
          },
        });
      }

      valores.push(estado);
      condiciones.push(`estado = $${valores.length}`);
    }

    let consulta = "SELECT * FROM solicitudes_adopcion";

    if (condiciones.length > 0) {
      consulta += ` WHERE ${condiciones.join(" AND ")}`;
    }

    consulta += " ORDER BY id";

    const { rows } = await pool.query(consulta, valores);

    return res.status(200).json({
      success: true,
      message: "Solicitudes obtenidas correctamente",
      data: rows,
    });
  } catch (error) {
    return next(error);
  }
};

//este por id, el otro era general
export const getSolicitudPorId = async (req, res, next) => {
  try {
    const id = obtenerIdValido(req.params.id);

    if (id === null) {
      return res.status(400).json({
        success: false,
        error: {
          message: "El id debe ser un número entero positivo",
        },
      });
    }

    const { rows } = await pool.query(
      "SELECT * FROM solicitudes_adopcion WHERE id = $1",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Solicitud no encontrada",
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Solicitud obtenida correctamente",
      data: rows[0],
    });
  } catch (error) {
    return next(error);
  }
};

//---------------------------------------------------------------------------------------------------//
// parte para POST, o sea para crear solicitudes de adopcion //
//esta es re larga porque hay caleta de verificaciones, que no se repita, que exista el user, el animal, que haya escrito bien los cosos, y otras cosas

export const crearSolicitud = async (req, res, next) => {
  const body = req.body;

  if (!esObjetoJson(body)) {
    return res.status(400).json({
      success: false,
      error: {
        message: "El cuerpo debe ser un objeto JSON",
      },
    });
  }

  const camposPermitidos = [
    "animal_id",
    "usuario_id",
    "notas",
    "tipo_vivienda",
    "tiene_patio",
    "con_quien_convive",
    "tuvo_mascotas",
    "tiene_mascotas",
    "experiencia",
    "motivo",
    "acepta_compromiso",
  ];
  const camposDesconocidos = Object.keys(body).filter(
    (campo) => !camposPermitidos.includes(campo)
  );

  if (camposDesconocidos.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: "Hay campos no permitidos",
        fields: camposDesconocidos,
      },
    });
  }

  const animalId = obtenerIdValido(body.animal_id);
  const usuarioId = obtenerIdValido(body.usuario_id);

  if (animalId === null) {
    return res.status(400).json({
      success: false,
      error: {
        message: "animal_id es obligatorio y debe ser un entero positivo",
      },
    });
  }

  // Temporal para las pruebas: luego usuario_id vendrá del JWT.
  if (usuarioId === null) {
    return res.status(400).json({
      success: false,
      error: {
        message: "usuario_id es obligatorio y debe ser un entero positivo",
      },
    });
  }

  let notas = null;
  
  //esto es para validar

  const camposInvalidos = [];
  const textosRequeridos = [
    "tipo_vivienda",
    "con_quien_convive",
    "motivo",
  ];

  const textos = {};

  for (const campo of textosRequeridos) {
    const valor = body[campo];

    if (typeof valor !== "string" || valor.trim().length === 0) {
      camposInvalidos.push(campo);
      continue;
    }

    if (campo === "tipo_vivienda" && valor.trim().length > 50) {
      camposInvalidos.push(campo);
      continue;
    }

    textos[campo] = valor.trim();
  }

  const camposBooleanos = [
    "tiene_patio",
    "tuvo_mascotas",
    "tiene_mascotas",
    "acepta_compromiso",
  ];

  for (const campo of camposBooleanos) {
    if (typeof body[campo] !== "boolean") {
      camposInvalidos.push(campo);
    }
  }

  let experiencia = null;

  if (body.experiencia !== undefined && body.experiencia !== null) {
    if (typeof body.experiencia !== "string") {
      camposInvalidos.push("experiencia");
    } else if (body.experiencia.trim().length > 0) {
      experiencia = body.experiencia.trim();
    }
  }

  if (camposInvalidos.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: "Hay campos obligatorios o con un formato inválido",
        fields: [...new Set(camposInvalidos)],
      },
    });
  }

  if (body.notas !== undefined && body.notas !== null) {
    if (typeof body.notas !== "string" || body.notas.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: "notas debe ser un texto no vacío o null",
        },
      });
    }

    notas = body.notas.trim();
  }

  let client;

  try {
    client = await pool.connect();
    await client.query("BEGIN");

    // esto hace pausa para ver que no este duplicandose una peticion
    
    const animalResultado = await client.query(
      "SELECT id, estado FROM animales WHERE id = $1 FOR UPDATE",
      [animalId]
    );

    if (animalResultado.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        error: {
          message: "Animal no encontrado",
        },
      });
    }

    if (animalResultado.rows[0].estado !== "EN_ADOPCION") {
      await client.query("ROLLBACK");

      return res.status(409).json({
        success: false,
        error: {
          message: "El animal no está disponible para postular",
        },
      });
    }

    const solicitudPendiente = await client.query(
      `SELECT id
       FROM solicitudes_adopcion
       WHERE animal_id = $1
         AND usuario_id = $2
         AND estado = $3
       LIMIT 1`,
      [animalId, usuarioId, "PENDIENTE"]
    );

    if (solicitudPendiente.rows.length > 0) {
      await client.query("ROLLBACK");

      return res.status(409).json({
        success: false,
        error: {
          message: "Ya existe una solicitud pendiente para este animal",
        },
      });
    }
    //esta de aqui ya insterta la nueva solicitud
    
    const { rows } = await client.query(
      `INSERT INTO solicitudes_adopcion (
        tipo_vivienda,tiene_patio,con_quien_convive,tuvo_mascotas,tiene_mascotas,
        experiencia,motivo,acepta_compromiso,notas,usuario_id,animal_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        textos.tipo_vivienda,body.tiene_patio,textos.con_quien_convive,body.tuvo_mascotas,body.tiene_mascotas,        
        experiencia,textos.motivo,body.acepta_compromiso,notas,usuarioId,animalId,                   
      ]
    );
    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      message: "Solicitud creada correctamente",
      data: rows[0],
    });
  } catch (error) {
    if (client) {
      try {
        await client.query("ROLLBACK");
      } catch {
        // Si la transacción ya terminó o la conexión falla se maneja como el error de siempre normalito
      }
    }

    if (error.code === "23503") {
      return res.status(400).json({
        success: false,
        error: {
          message: "El usuario indicado no existe",
        },
      });
    }

    return next(error);
  } finally {
    if (client) {
      client.release();
    }
  }
};

//---------------------------------------------------------------------------------------------------//
// parte para PATCH de las solicitudes ya existentes //
// tambien pide muchas verificaciones, pero ademas de todas esas, esta mide el estado de la solicitud para poder cambiarla de activa, cancelada,etc

export const actualizarSolicitud = async (req, res, next) => {
  const id = obtenerIdValido(req.params.id);

  if (id === null) {
    return res.status(400).json({
      success: false,
      error: {
        message: "El id debe ser un número entero positivo",
      },
    });
  }

  const body = req.body;

  if (!esObjetoJson(body)) {
    return res.status(400).json({
      success: false,
      error: {
        message: "El cuerpo debe ser un objeto JSON",
      },
    });
  }

  const campos = Object.keys(body);

  if (campos.length !== 1 || campos[0] !== "estado") {
    return res.status(400).json({
      success: false,
      error: {
        message: "Solo se permite actualizar el estado",
      },
    });
  }

  let client;

  try {
    client = await pool.connect();
    await client.query("BEGIN");

    // Obtiene el animal para bloquearlo antes de cambiar cualquier solicitud suya.
    const solicitudInicial = await client.query(
      "SELECT animal_id FROM solicitudes_adopcion WHERE id = $1",
      [id]
    );

    if (solicitudInicial.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        error: {
          message: "Solicitud no encontrada",
        },
      });
    }

    const animalId = solicitudInicial.rows[0].animal_id;

    const animalResultado = await client.query(
      "SELECT id, estado FROM animales WHERE id = $1 FOR UPDATE",
      [animalId]
    );

    const solicitudResultado = await client.query(
      `SELECT id, animal_id, estado
       FROM solicitudes_adopcion
       WHERE id = $1
       FOR UPDATE`,
      [id]
    );

    if (solicitudResultado.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        error: {
          message: "Solicitud no encontrada",
        },
      });
    }

    if (animalResultado.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        error: {
          message: "El animal asociado no existe",
        },
      });
    }

    const solicitud = solicitudResultado.rows[0];
    const transiciones = transicionesPermitidas[solicitud.estado];

    if (!transiciones || !transiciones.includes(body.estado)) {
      await client.query("ROLLBACK");

      return res.status(409).json({
        success: false,
        error: {
          message: "No se permite ese cambio de estado",
          estadoActual: solicitud.estado,
          estadosPermitidos: transiciones ?? [],
        },
      });
    }

    if (body.estado === "APROBADA") {
      if (animalResultado.rows[0].estado !== "EN_ADOPCION") {
        await client.query("ROLLBACK");

        return res.status(409).json({
          success: false,
          error: {
            message: "El animal ya no está disponible",
          },
        });
      }

      await client.query(
        "UPDATE animales SET estado = $1 WHERE id = $2",
        ["ADOPTADO", animalId]
      );

      await client.query(
        `UPDATE solicitudes_adopcion
         SET estado = $1
         WHERE animal_id = $2
           AND id <> $3
           AND estado = $4`,
        ["RECHAZADA", animalId, id, "PENDIENTE"]
      );
    }

    const { rows } = await client.query(
      `UPDATE solicitudes_adopcion
       SET estado = $1
       WHERE id = $2
       RETURNING *`,
      [body.estado, id]
    );

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "Solicitud actualizada correctamente",
      data: rows[0],
    });
  } catch (error) {
    if (client) {
      try {
        await client.query("ROLLBACK");
      } catch {
        // Se conserva y se maneja el error original.
      }
    }

    return next(error);
  } finally {
    if (client) {
      client.release();
    }
  }
};

//---------------------------------------------------------------------------------------------------//
// parte para DELETE de las solicitudes, dificil dar uso a esta si porq la idea es guardar un registro yo creo //

export const eliminarSolicitud = async (req, res, next) => {
  const id = obtenerIdValido(req.params.id);

  if (id === null) {
    return res.status(400).json({
      success: false,
      error: {
        message: "El id debe ser un número entero positivo",
      },
    });
  }

  try {
    const { rows } = await pool.query(
      "DELETE FROM solicitudes_adopcion WHERE id = $1 RETURNING *",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Solicitud no encontrada",
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Solicitud eliminada correctamente",
      data: rows[0],
    });
  } catch (error) {
    return next(error);
  }
};

//---------------------------------------------------------------------------------------------------//