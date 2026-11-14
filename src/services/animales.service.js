import fs from "node:fs/promises";
import path from "node:path";
import { pool } from "../config/database.js";
import { directorioUploads } from "../middleware/upload.js";
import { ErrorHttp } from "../utils/errores.js";
import { conTransaccion } from "../utils/transaccion.js";
import { esObjetoJson, exigirId } from "../utils/validaciones.js";

//---------------------------------------------------------------------------------------------------//
// CONSTANTES
//---------------------------------------------------------------------------------------------------//
const estadosPermitidos = ["EN_ADOPCION", "ADOPTADO", "EN_TRATAMIENTO"];
const MAX_FOTOS = 5;
const MSG_ID = "El id debe ser un número entero";

const valoresPermitidosPorCampo = {
  sexo: ["MACHO", "HEMBRA"],
  tamanho: ["PEQUEÑO", "PEQUENO", "MEDIANO", "GRANDE"],
  rescate: ["RESCATE", "ENTREGADO_FAMILIA", "REFUGIO", "CAMADA"],
  vacunas_estado: ["AL_DIA", "FALTAN", "NO_TIENE"],
  esterilizado: ["SI", "NO", "NO_SABE"],
};

const camposTexto = [
  "nombre", "especie", "sexo", "tamanho", "ciudad", "rescate", "descripcion",
  "personalidad", "vacunas_estado", "vacunas_detalles", "esterilizado",
  "cuidado_especial", "razon_adopcion",
];

const limitesTexto = {
  nombre: 100, especie: 50, sexo: 20, tamanho: 20, ciudad: 100,
  vacunas_estado: 20, esterilizado: 20,
};

const camposObligatorios = ["nombre", "especie"];
const camposArreglo = ["ideal_para", "convive_con", "etiquetas"];
const camposEnteros = ["edad", "edad_meses"];

const camposPermitidos = [
  ...camposTexto, ...camposArreglo, ...camposEnteros, "fecha_esterilizacion", "estado",
];

//---------------------------------------------------------------------------------------------------//
// FUNCIONES AUXILIARES (privadas del servicio)
//---------------------------------------------------------------------------------------------------//

function esFechaIsoValida(valor) {
  if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const fecha = new Date(`${valor}T00:00:00.000Z`);
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === valor;
}

/** El dueño del animal o un admin pueden gestionarlo. */
function puedeGestionar(usuario, animal) {
  return usuario?.rol === "ADMIN" || Number(animal?.usuario_id) === usuario?.id;
}

/** Archivos subidos en esta petición (rutas de disco), para borrarlos si algo falla. */
async function descartarArchivos(files = []) {
  await Promise.all(files.map((f) => fs.unlink(f.path).catch(() => {})));
}

/** Borra del disco fotos ya guardadas ("/uploads/archivo.jpg"). basename evita salirse de la carpeta. */
async function borrarFotosDelDisco(urls = []) {
  await Promise.all(
    urls.map((url) => fs.unlink(path.join(directorioUploads, path.basename(String(url)))).catch(() => {}))
  );
}

/**
 * Con multipart llega como texto: convierte números y listas ("a,b") a su tipo real.
 * Un texto vacío significa "sin valor": al crear se omite, al editar se guarda null (borra el dato).
 */
function normalizarBody(origen, { alCrear = false } = {}) {
  const body = { ...origen };
  const vacio = (campo) => (alCrear ? delete body[campo] : (body[campo] = null));

  for (const campo of camposEnteros) {
    if (typeof body[campo] !== "string") continue;
    if (body[campo].trim() === "") vacio(campo);
    else body[campo] = Number(body[campo]);
  }

  for (const campo of camposArreglo) {
    if (typeof body[campo] !== "string") continue;
    const items = body[campo].split(",").map((i) => i.trim()).filter(Boolean);
    if (items.length === 0) vacio(campo);
    else body[campo] = items;
  }

  for (const campo of [...camposTexto, "fecha_esterilizacion"]) {
    if (typeof body[campo] === "string" && body[campo].trim() === "") vacio(campo);
  }

  return body;
}

/** Valida y limpia los datos del animal. Devuelve `datos` o lanza un ErrorHttp 400. */
function validarDatosAnimal(body, { alCrear = false } = {}) {
  const camposDesconocidos = Object.keys(body).filter((campo) => !camposPermitidos.includes(campo));

  if (camposDesconocidos.length > 0) {
    throw new ErrorHttp(400, "Hay campos que no se permiten en esta operación", { fields: camposDesconocidos });
  }

  const datos = {};
  const camposInvalidos = [];

  for (const campo of camposTexto) {
    const esObligatorio = camposObligatorios.includes(campo);
    if (body[campo] === undefined) {
      if (alCrear && esObligatorio) camposInvalidos.push(campo);
      else if (alCrear) datos[campo] = null;
      continue;
    }
    if (body[campo] === null) {
      if (esObligatorio) camposInvalidos.push(campo);
      else datos[campo] = null;
      continue;
    }
    if (typeof body[campo] !== "string" || body[campo].trim().length === 0) {
      camposInvalidos.push(campo);
      continue;
    }
    let valor = body[campo].trim();
    if (valoresPermitidosPorCampo[campo]) {
      valor = valor.toUpperCase();
      if (!valoresPermitidosPorCampo[campo].includes(valor)) {
        camposInvalidos.push(campo);
        continue;
      }
    }
    if (limitesTexto[campo] && valor.length > limitesTexto[campo]) {
      camposInvalidos.push(campo);
      continue;
    }
    datos[campo] = valor;
  }

  for (const campo of camposEnteros) {
    if (body[campo] === undefined) {
      if (alCrear) datos[campo] = null;
      continue;
    }
    if (body[campo] === null) {
      datos[campo] = null;
      continue;
    }
    if (!Number.isInteger(body[campo]) || body[campo] < 0) {
      camposInvalidos.push(campo);
      continue;
    }
    datos[campo] = body[campo];
  }

  for (const campo of camposArreglo) {
    if (body[campo] === undefined) {
      if (alCrear) datos[campo] = null;
      continue;
    }
    if (body[campo] === null) {
      datos[campo] = null;
      continue;
    }
    if (!Array.isArray(body[campo]) || !body[campo].every((v) => typeof v === "string" && v.trim().length > 0)) {
      camposInvalidos.push(campo);
      continue;
    }
    datos[campo] = body[campo].map((v) => v.trim());
  }

  if (body.fecha_esterilizacion === undefined) {
    if (alCrear) datos.fecha_esterilizacion = null;
  } else if (body.fecha_esterilizacion === null) {
    datos.fecha_esterilizacion = null;
  } else if (!esFechaIsoValida(body.fecha_esterilizacion)) {
    camposInvalidos.push("fecha_esterilizacion");
  } else {
    datos.fecha_esterilizacion = body.fecha_esterilizacion;
  }

  if (body.estado === undefined) {
    if (alCrear) datos.estado = "EN_ADOPCION";
  } else if (!estadosPermitidos.includes(body.estado)) {
    throw new ErrorHttp(400, "El estado del animal no es válido", { allowedValues: estadosPermitidos });
  } else {
    datos.estado = body.estado;
  }

  if (camposInvalidos.length > 0) {
    throw new ErrorHttp(400, "Hay campos obligatorios o con un formato inválido", {
      fields: [...new Set(camposInvalidos)],
    });
  }

  return datos;
}

/** Lee `fotos_conservar` del body. undefined = no tocar las fotos existentes. */
function leerFotosConservar(body) {
  if (body.fotos_conservar === undefined) return undefined;

  const lista = Array.isArray(body.fotos_conservar)
    ? body.fotos_conservar
    : String(body.fotos_conservar).split(",").filter((t) => t.trim() !== "");
  const ids = lista.map(Number);

  if (ids.some((n) => !Number.isInteger(n) || n <= 0) || new Set(ids).size !== ids.length) {
    throw new ErrorHttp(400, "fotos_conservar debe ser una lista de ids sin repetir");
  }
  return ids;
}

/**
 * Deja las fotos del animal como pide el cliente: quita las que no se conservan,
 * reordena las que se quedan y agrega las nuevas al final.
 * Devuelve las URLs quitadas, para borrarlas del disco una vez confirmada la transacción.
 */
async function sincronizarFotos(client, animalId, idsConservar, archivos) {
  const { rows: actuales } = await client.query(
    "SELECT id, imagen_url FROM foto_animales WHERE animal_id = $1",
    [animalId]
  );
  const conservar = idsConservar ?? actuales.map((f) => f.id);

  if (!conservar.every((fid) => actuales.some((f) => f.id === fid))) {
    throw new ErrorHttp(400, "Alguna foto indicada no pertenece a este animal");
  }

  const total = conservar.length + archivos.length;
  if (total < 1 || total > MAX_FOTOS) {
    throw new ErrorHttp(400, `El animal debe tener entre 1 y ${MAX_FOTOS} fotos (quedarían ${total})`);
  }

  const quitar = actuales.filter((f) => !conservar.includes(f.id));
  if (quitar.length > 0) {
    await client.query("DELETE FROM foto_animales WHERE id = ANY($1::int[])", [quitar.map((f) => f.id)]);
  }

  for (let i = 0; i < conservar.length; i++) {
    await client.query("UPDATE foto_animales SET orden = $1 WHERE id = $2", [i + 1, conservar[i]]);
  }
  for (let i = 0; i < archivos.length; i++) {
    await client.query(
      "INSERT INTO foto_animales (animal_id, imagen_url, orden) VALUES ($1, $2, $3)",
      [animalId, `/uploads/${archivos[i].filename}`, conservar.length + i + 1]
    );
  }

  return quitar.map((f) => f.imagen_url);
}

async function cargarFotos(animal) {
  const { rows } = await pool.query(
    "SELECT id, imagen_url, orden FROM foto_animales WHERE animal_id = $1 ORDER BY orden ASC",
    [animal.id]
  );
  animal.fotos = rows;
  return animal;
}

//---------------------------------------------------------------------------------------------------//
// CASOS DE USO
//---------------------------------------------------------------------------------------------------//

/** Crea el animal y sus fotos en una sola transacción. */
export async function crearAnimal(usuario, cuerpo, archivos = []) {
  let confirmado = false;

  try {
    if (!esObjetoJson(cuerpo)) throw new ErrorHttp(400, "El cuerpo debe ser un objeto JSON válido");

    const body = normalizarBody(cuerpo, { alCrear: true });
    // El estado inicial lo decide el servidor, no el cliente
    delete body.estado;

    const datos = validarDatosAnimal(body, { alCrear: true });

    if (archivos.length === 0) throw new ErrorHttp(400, "Debes subir al menos una foto");

    datos.usuario_id = usuario.id;

    const animalCreado = await conTransaccion(async (client) => {
      const { rows } = await client.query(
        `INSERT INTO animales (
          nombre, especie, edad, edad_meses, sexo, tamanho, ciudad, rescate,
          descripcion, personalidad, ideal_para, convive_con, etiquetas,
          cuidado_especial, razon_adopcion, vacunas_estado, vacunas_detalles,
          esterilizado, fecha_esterilizacion, estado, usuario_id
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
          $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
        ) RETURNING *`,
        [
          datos.nombre, datos.especie, datos.edad, datos.edad_meses, datos.sexo, datos.tamanho, datos.ciudad, datos.rescate, datos.descripcion,
          datos.personalidad, datos.ideal_para, datos.convive_con, datos.etiquetas, datos.cuidado_especial, datos.razon_adopcion, datos.vacunas_estado,
          datos.vacunas_detalles, datos.esterilizado, datos.fecha_esterilizacion, datos.estado, datos.usuario_id,
        ]
      );
      const animal = rows[0];

      animal.fotos = [];
      for (let i = 0; i < archivos.length; i++) {
        const foto = await client.query(
          "INSERT INTO foto_animales (animal_id, imagen_url, orden) VALUES ($1, $2, $3) RETURNING id, imagen_url, orden",
          [animal.id, `/uploads/${archivos[i].filename}`, i + 1]
        );
        animal.fotos.push(foto.rows[0]);
      }
      return animal;
    });

    confirmado = true;
    return animalCreado;
  } catch (error) {
    if (error.code === "23503") throw new ErrorHttp(400, "El usuario indicado no existe");
    throw error;
  } finally {
    // Si no se guardó, las fotos subidas no deben quedar sueltas en el disco
    if (!confirmado) await descartarArchivos(archivos);
  }
}

/** Catálogo público (en adopción y en tratamiento; los adoptados no se muestran). */
export async function listarAnimales() {
  const { rows } = await pool.query(`
    SELECT
      a.id, a.nombre, a.especie, a.edad, a.edad_meses, a.sexo, a.tamanho,
      a.ciudad, a.estado, a.descripcion, a.etiquetas, a.usuario_id, a.creado_en,
      f.imagen_url AS imagen_portada
    FROM animales a
           LEFT JOIN foto_animales f ON a.id = f.animal_id AND f.orden = 1
    WHERE a.estado IN ('EN_ADOPCION', 'EN_TRATAMIENTO')
    ORDER BY a.id DESC;
  `);
  return rows;
}

/** Publicaciones del usuario en cualquier estado. El ADMIN puede pedir todas con `todos`. */
export async function listarMisAnimales(usuario, { todos = false } = {}) {
  const verTodos = usuario.rol === "ADMIN" && todos;
  const valores = verTodos ? [] : [usuario.id];

  const { rows } = await pool.query(
    `SELECT
       a.id, a.nombre, a.especie, a.edad, a.edad_meses, a.sexo, a.tamanho,
       a.ciudad, a.estado, a.descripcion, a.usuario_id, a.creado_en,
       f.imagen_url AS imagen_portada,
       u.nombre AS publicador_nombre,
       (SELECT COUNT(*)::int FROM solicitudes_adopcion s
         WHERE s.animal_id = a.id AND s.estado = 'PENDIENTE') AS solicitudes_pendientes
     FROM animales a
       JOIN usuarios u ON u.id = a.usuario_id
       LEFT JOIN foto_animales f ON a.id = f.animal_id AND f.orden = 1
     ${verTodos ? "" : "WHERE a.usuario_id = $1"}
     ORDER BY a.id DESC`,
    valores
  );
  return rows;
}

/** Un animal adoptado solo lo ve su dueño o un admin. `usuario` puede ser undefined (visitante). */
export async function obtenerAnimal(idParametro, usuario) {
  const id = exigirId(idParametro, MSG_ID);

  const { rows } = await pool.query("SELECT * FROM animales WHERE id = $1", [id]);
  const animal = rows[0];

  if (!animal || (animal.estado === "ADOPTADO" && !puedeGestionar(usuario, animal))) {
    throw new ErrorHttp(404, "Animal no encontrado");
  }

  return cargarFotos(animal);
}

/**
 * Acepta datos y fotos:
 *   fotos_conservar = "12,15,9"  ids de las fotos que se quedan, en el orden deseado
 *                    (si no se envía, se conservan todas)
 *   archivos        = fotos nuevas, se agregan al final
 * El total debe quedar entre 1 y 5.
 */
export async function actualizarAnimal(idParametro, usuario, cuerpo, archivos = []) {
  let confirmado = false;
  let fotosABorrar = [];

  try {
    const id = exigirId(idParametro, MSG_ID);

    if (!esObjetoJson(cuerpo)) throw new ErrorHttp(400, "El cuerpo debe ser un objeto JSON");

    const idsConservar = leerFotosConservar(cuerpo);

    const body = normalizarBody(cuerpo);
    delete body.fotos_conservar;

    const tocaFotos = idsConservar !== undefined || archivos.length > 0;
    const hayCampos = Object.keys(body).length > 0;
    if (!hayCampos && !tocaFotos) throw new ErrorHttp(400, "Debes enviar campos para actualizar");

    const datos = hayCampos ? validarDatosAnimal(body) : {};

    await conTransaccion(async (client) => {
      // Bloquea el animal mientras se edita, para que dos ediciones no se pisen
      const existente = await client.query("SELECT id, usuario_id FROM animales WHERE id = $1 FOR UPDATE", [id]);
      if (existente.rows.length === 0) throw new ErrorHttp(404, "Animal no encontrado");
      if (!puedeGestionar(usuario, existente.rows[0])) {
        throw new ErrorHttp(403, "No tienes permiso para modificar este animal");
      }

      // Los nombres de columna salen de validarDatosAnimal (lista blanca), nunca del cliente
      const columnas = Object.keys(datos);
      if (columnas.length > 0) {
        const cambios = columnas.map((campo, i) => `${campo} = $${i + 1}`).join(", ");
        await client.query(`UPDATE animales SET ${cambios} WHERE id = $${columnas.length + 1}`, [
          ...columnas.map((campo) => datos[campo]),
          id,
        ]);
      }

      if (tocaFotos) {
        fotosABorrar = await sincronizarFotos(client, id, idsConservar, archivos);
      }
    });
    confirmado = true;

    // Solo tras confirmar se borran del disco las fotos quitadas
    await borrarFotosDelDisco(fotosABorrar);

    const { rows } = await pool.query("SELECT * FROM animales WHERE id = $1", [id]);
    return await cargarFotos(rows[0]);
  } finally {
    if (!confirmado) await descartarArchivos(archivos);
  }
}

/** El dueño o un admin, en cualquier estado. Borra también las fotos del disco. */
export async function eliminarAnimal(idParametro, usuario) {
  const id = exigirId(idParametro, MSG_ID);

  const existente = await pool.query("SELECT id, usuario_id FROM animales WHERE id = $1", [id]);
  if (existente.rows.length === 0) throw new ErrorHttp(404, "Animal no encontrado");

  if (!puedeGestionar(usuario, existente.rows[0])) {
    throw new ErrorHttp(403, "No tienes permiso para eliminar este animal");
  }

  // Las fotos se leen antes, porque el ON DELETE CASCADE borra sus filas junto con el animal
  const { rows: fotos } = await pool.query("SELECT imagen_url FROM foto_animales WHERE animal_id = $1", [id]);

  const { rows } = await pool.query("DELETE FROM animales WHERE id = $1 RETURNING *", [id]);
  if (rows.length === 0) throw new ErrorHttp(404, "Animal no encontrado");

  await borrarFotosDelDisco(fotos.map((f) => f.imagen_url));

  return rows[0];
}
