import { pool } from "../config/database.js";
import { ErrorHttp } from "../utils/errores.js";
import { conTransaccion } from "../utils/transaccion.js";
import { esObjetoJson, exigirId, obtenerIdValido } from "../utils/validaciones.js";
import { enviarCorreoSolicitud } from "./email.service.js";

//---------------------------------------------------------------------------------------------------//
// CONSTANTES
//---------------------------------------------------------------------------------------------------//
const estadosPermitidos = ["PENDIENTE", "APROBADA", "RECHAZADA"];

// Desde qué estado se puede pasar a cuáles
const transicionesPermitidas = {
  PENDIENTE: ["APROBADA", "RECHAZADA"],
};

const MSG_ID = "El id debe ser un número entero positivo";

const camposPermitidos = [
  "animal_id", "notas", "tipo_vivienda", "tiene_patio", "con_quien_convive",
  "tuvo_mascotas", "tiene_mascotas", "experiencia", "motivo", "acepta_compromiso",
  "telefono", "ciudad",
];
const textosRequeridos = ["tipo_vivienda", "con_quien_convive", "motivo"];
const camposBooleanos = ["tiene_patio", "tuvo_mascotas", "tiene_mascotas", "acepta_compromiso"];

// Solicitud + datos del postulante + datos del animal (se usa en los GET)
const SELECT_SOLICITUD = `
  SELECT s.*,
         u.nombre AS postulante_nombre,
         u.correo AS postulante_correo,
         a.nombre AS animal_nombre,
         a.especie AS animal_especie,
         a.estado AS animal_estado,
         (SELECT f.imagen_url FROM foto_animales f
          WHERE f.animal_id = a.id AND f.orden = 1) AS animal_imagen
  FROM solicitudes_adopcion s
         JOIN usuarios u ON u.id = s.usuario_id
         JOIN animales a ON a.id = s.animal_id`;

//---------------------------------------------------------------------------------------------------//
// VALIDACIÓN (privada del servicio)
//---------------------------------------------------------------------------------------------------//

/** Valida el cuerpo de POST /solicitudes y devuelve los datos limpios. Lanza ErrorHttp 400 si algo falla. */
function validarDatosSolicitud(body) {
  if (!esObjetoJson(body)) throw new ErrorHttp(400, "El cuerpo debe ser un objeto JSON");

  const camposDesconocidos = Object.keys(body).filter((campo) => !camposPermitidos.includes(campo));
  if (camposDesconocidos.length > 0) {
    throw new ErrorHttp(400, "Hay campos no permitidos", { fields: camposDesconocidos });
  }

  const animalId = obtenerIdValido(body.animal_id);
  if (animalId === null) {
    throw new ErrorHttp(400, "animal_id es obligatorio y debe ser un entero positivo");
  }

  const camposInvalidos = [];
  const datos = { animal_id: animalId };

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
    datos[campo] = valor.trim();
  }

  for (const campo of camposBooleanos) {
    if (typeof body[campo] !== "boolean") camposInvalidos.push(campo);
    else datos[campo] = body[campo];
  }

  const telefono = typeof body.telefono === "string" ? body.telefono.replace(/[\s-]/g, "") : "";
  if (!/^\+\d{8,18}$/.test(telefono)) camposInvalidos.push("telefono");
  datos.telefono = telefono;

  const ciudad = typeof body.ciudad === "string" ? body.ciudad.trim() : "";
  if (!ciudad || ciudad.length > 100) camposInvalidos.push("ciudad");
  datos.ciudad = ciudad;

  datos.experiencia = null;
  if (body.experiencia !== undefined && body.experiencia !== null) {
    if (typeof body.experiencia !== "string") {
      camposInvalidos.push("experiencia");
    } else if (body.experiencia.trim().length > 0) {
      datos.experiencia = body.experiencia.trim();
    }
  }

  if (camposInvalidos.length > 0) {
    throw new ErrorHttp(400, "Hay campos obligatorios o con un formato inválido", {
      fields: [...new Set(camposInvalidos)],
    });
  }

  datos.notas = null;
  if (body.notas !== undefined && body.notas !== null) {
    if (typeof body.notas !== "string" || body.notas.trim().length === 0) {
      throw new ErrorHttp(400, "notas debe ser un texto no vacío o null");
    }
    datos.notas = body.notas.trim();
  }

  return datos;
}

//---------------------------------------------------------------------------------------------------//
// NOTIFICACIÓN POR CORREO (privada del servicio)
//---------------------------------------------------------------------------------------------------//

/**
 * Avisa por correo al rescatista dueño del animal que recibió una nueva solicitud.
 * Nunca lanza errores: la solicitud ya está guardada y el correo es solo un aviso.
 */
async function notificarNuevaSolicitud(usuarioId, animalId) {
  try {
    const { rows } = await pool.query(
        `SELECT a.nombre AS animal_nombre,
              r.correo AS rescatista_correo,
              p.nombre AS postulante_nombre
       FROM animales a
       JOIN usuarios r ON r.id = a.usuario_id
       JOIN usuarios p ON p.id = $2
       WHERE a.id = $1`,
        [animalId, usuarioId]
    );
    if (rows.length === 0) return;

    await enviarCorreoSolicitud({
      emailDestino: rows[0].rescatista_correo,
      nombreAnimal: rows[0].animal_nombre,
      nombrePostulante: rows[0].postulante_nombre,
    });
  } catch (error) {
    console.error("No se pudo preparar el correo de la solicitud:", error.message);
  }
}

//---------------------------------------------------------------------------------------------------//
// CASOS DE USO
//---------------------------------------------------------------------------------------------------//

/**
 * Lista solicitudes según el rol:
 *  - ADOPTANTE (o ?mias=true): las que envió.
 *  - RESCATISTA: las recibidas en sus animales.
 *  - ADMIN: todas.
 * Filtros opcionales: animal_id, usuario_id, estado.
 */
export async function listarSolicitudes(usuario, query = {}) {
  const { animal_id, usuario_id, estado, mias } = query;
  const condiciones = [];
  const valores = [];

  if (mias === "true" || usuario.rol === "ADOPTANTE") {
    valores.push(usuario.id);
    condiciones.push(`s.usuario_id = $${valores.length}`);
  } else if (usuario.rol === "RESCATISTA") {
    valores.push(usuario.id);
    condiciones.push(`a.usuario_id = $${valores.length}`);
  }

  if (animal_id !== undefined) {
    const animalIdBuscado = obtenerIdValido(animal_id);
    if (animalIdBuscado === null) {
      throw new ErrorHttp(400, "animal_id debe ser un número entero positivo");
    }
    valores.push(animalIdBuscado);
    condiciones.push(`s.animal_id = $${valores.length}`);
  }

  if (usuario_id !== undefined) {
    const usuarioIdBuscado = obtenerIdValido(usuario_id);
    if (usuarioIdBuscado === null) {
      throw new ErrorHttp(400, "usuario_id debe ser un número entero positivo");
    }
    valores.push(usuarioIdBuscado);
    condiciones.push(`s.usuario_id = $${valores.length}`);
  }

  if (estado !== undefined) {
    if (!estadosPermitidos.includes(estado)) {
      throw new ErrorHttp(400, "El estado de la solicitud no es válido", { allowedValues: estadosPermitidos });
    }
    valores.push(estado);
    condiciones.push(`s.estado = $${valores.length}`);
  }

  let consulta = SELECT_SOLICITUD;
  if (condiciones.length > 0) consulta += ` WHERE ${condiciones.join(" AND ")}`;
  consulta += " ORDER BY s.id DESC";

  const { rows } = await pool.query(consulta, valores);
  return rows;
}

/** La ve su autor, el dueño del animal y el admin. */
export async function obtenerSolicitud(idParametro, usuario) {
  const id = exigirId(idParametro, MSG_ID);

  const { rows } = await pool.query(
      `${SELECT_SOLICITUD}
     WHERE s.id = $1
       AND ($2::text = 'ADMIN' OR s.usuario_id = $3 OR a.usuario_id = $3)`,
      [id, usuario.rol, usuario.id]
  );

  if (rows.length === 0) throw new ErrorHttp(404, "Solicitud no encontrada");
  return rows[0];
}

/** Crea una solicitud de adopción en estado PENDIENTE y avisa por correo al rescatista. */
export async function crearSolicitud(usuario, body) {
  const datos = validarDatosSolicitud(body);

  let solicitudCreada;
  try {
    solicitudCreada = await conTransaccion(async (client) => {
      // Bloquea el animal para que dos peticiones simultáneas no se pisen
      const animalResultado = await client.query(
          "SELECT id, estado, usuario_id FROM animales WHERE id = $1 FOR UPDATE",
          [datos.animal_id]
      );
      const animal = animalResultado.rows[0];

      if (!animal) throw new ErrorHttp(404, "Animal no encontrado");

      if (Number(animal.usuario_id) === usuario.id) {
        throw new ErrorHttp(403, "No puedes solicitar un animal que es tuyo");
      }

      if (animal.estado !== "EN_ADOPCION") {
        throw new ErrorHttp(409, "El animal no está disponible para postular");
      }

      // Una persona solo puede postular una vez a cada animal, sea cual sea el estado
      // de su solicitud anterior (la base lo garantiza con UNIQUE (usuario_id, animal_id))
      const solicitudPrevia = await client.query(
          "SELECT id FROM solicitudes_adopcion WHERE animal_id = $1 AND usuario_id = $2 LIMIT 1",
          [datos.animal_id, usuario.id]
      );
      if (solicitudPrevia.rows.length > 0) {
        throw new ErrorHttp(409, "Ya enviaste una solicitud para este animal");
      }

      const { rows } = await client.query(
          `INSERT INTO solicitudes_adopcion (
           tipo_vivienda, tiene_patio, con_quien_convive, tuvo_mascotas, tiene_mascotas,
           experiencia, motivo, acepta_compromiso, notas, usuario_id, animal_id, telefono, ciudad
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING *`,
          [
            datos.tipo_vivienda, datos.tiene_patio, datos.con_quien_convive, datos.tuvo_mascotas, datos.tiene_mascotas,
            datos.experiencia, datos.motivo, datos.acepta_compromiso, datos.notas, usuario.id, datos.animal_id,
            datos.telefono, datos.ciudad,
          ]
      );
      return rows[0];
    });
  } catch (error) {
    if (error.code === "23503") throw new ErrorHttp(400, "El usuario indicado no existe");
    // Respaldo: si dos peticiones llegaran a la vez, la restricción UNIQUE de la base lo detiene
    if (error.code === "23505") throw new ErrorHttp(409, "Ya enviaste una solicitud para este animal");
    throw error;
  }

  // La transacción ya terminó. El correo se envía sin esperar (no retrasa ni rompe la respuesta).
  void notificarNuevaSolicitud(usuario.id, datos.animal_id);

  return solicitudCreada;
}

/**
 * Aprueba o rechaza una solicitud pendiente.
 * Al aprobar: el animal pasa a EN_TRATAMIENTO y las demás solicitudes pendientes se rechazan.
 */
export async function cambiarEstadoSolicitud(idParametro, usuario, body) {
  const id = exigirId(idParametro, MSG_ID);

  if (!esObjetoJson(body)) throw new ErrorHttp(400, "El cuerpo debe ser un objeto JSON");

  const campos = Object.keys(body);
  if (campos.length !== 1 || campos[0] !== "estado") {
    throw new ErrorHttp(400, "Solo se permite actualizar el estado");
  }
  const nuevoEstado = body.estado;

  return conTransaccion(async (client) => {
    // Se obtiene el animal primero para bloquearlo antes de tocar cualquier solicitud suya
    const solicitudInicial = await client.query(
        "SELECT animal_id FROM solicitudes_adopcion WHERE id = $1",
        [id]
    );
    if (solicitudInicial.rows.length === 0) throw new ErrorHttp(404, "Solicitud no encontrada");

    const animalId = solicitudInicial.rows[0].animal_id;

    const animalResultado = await client.query(
        "SELECT id, estado, usuario_id FROM animales WHERE id = $1 FOR UPDATE",
        [animalId]
    );
    const solicitudResultado = await client.query(
        "SELECT id, animal_id, estado FROM solicitudes_adopcion WHERE id = $1 FOR UPDATE",
        [id]
    );

    if (solicitudResultado.rows.length === 0) throw new ErrorHttp(404, "Solicitud no encontrada");
    if (animalResultado.rows.length === 0) throw new ErrorHttp(404, "El animal asociado no existe");

    const animal = animalResultado.rows[0];
    const solicitud = solicitudResultado.rows[0];

    // Un rescatista solo gestiona solicitudes de sus animales (para él, las demás "no existen")
    if (usuario.rol === "RESCATISTA" && Number(animal.usuario_id) !== usuario.id) {
      throw new ErrorHttp(404, "Solicitud no encontrada");
    }

    const transiciones = transicionesPermitidas[solicitud.estado];
    if (!transiciones || !transiciones.includes(nuevoEstado)) {
      throw new ErrorHttp(409, "No se permite ese cambio de estado", {
        estadoActual: solicitud.estado,
        estadosPermitidos: transiciones ?? [],
      });
    }

    if (nuevoEstado === "APROBADA") {
      if (animal.estado !== "EN_ADOPCION") throw new ErrorHttp(409, "El animal ya no está disponible");

      await client.query("UPDATE animales SET estado = $1 WHERE id = $2", ["EN_TRATAMIENTO", animalId]);

      await client.query(
          `UPDATE solicitudes_adopcion
         SET estado = $1
         WHERE animal_id = $2 AND id <> $3 AND estado = $4`,
          ["RECHAZADA", animalId, id, "PENDIENTE"]
      );
    }

    const { rows } = await client.query(
        "UPDATE solicitudes_adopcion SET estado = $1 WHERE id = $2 RETURNING *",
        [nuevoEstado, id]
    );
    return rows[0];
  });
}

/** Solo ADMIN (lo controla la ruta). */
export async function eliminarSolicitud(idParametro) {
  const id = exigirId(idParametro, MSG_ID);

  const { rows } = await pool.query("DELETE FROM solicitudes_adopcion WHERE id = $1 RETURNING *", [id]);
  if (rows.length === 0) throw new ErrorHttp(404, "Solicitud no encontrada");

  return rows[0];
}