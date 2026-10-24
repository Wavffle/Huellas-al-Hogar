import fs from "node:fs/promises";
import path from "node:path";
import { pool } from "../config/database.js";
import { directorioUploads } from "../middleware/upload.js";

//---------------------------------------------------------------------------------------------------//
// CONSTANTES Y FUNCIONES AUXILIARES
//---------------------------------------------------------------------------------------------------//
const estadosPermitidos = ["EN_ADOPCION", "ADOPTADO", "EN_TRATAMIENTO"];
const MAX_FOTOS = 5;

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

function esObjetoJson(body) {
  return body !== null && typeof body === "object" && !Array.isArray(body);
}

function obtenerIdValido(idParametro) {
  const id = Number(idParametro);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

function esFechaIsoValida(valor) {
  if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const fecha = new Date(`${valor}T00:00:00.000Z`);
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === valor;
}

const error400 = (res, message, extra = {}) =>
    res.status(400).json({ success: false, error: { message, ...extra } });

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

function validarDatosAnimal(body, { alCrear = false } = {}) {
  const camposDesconocidos = Object.keys(body).filter((campo) => !camposPermitidos.includes(campo));

  if (camposDesconocidos.length > 0) {
    return { error: { message: "Hay campos que no se permiten en esta operación", fields: camposDesconocidos } };
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
    return { error: { message: "El estado del animal no es válido", allowedValues: estadosPermitidos } };
  } else {
    datos.estado = body.estado;
  }

  if (camposInvalidos.length > 0) {
    return { error: { message: "Hay campos obligatorios o con un formato inválido", fields: [...new Set(camposInvalidos)] } };
  }

  return { datos };
}

//---------------------------------------------------------------------------------------------------//
// POST /api/animales: crea el animal y sus fotos en una sola transacción
//---------------------------------------------------------------------------------------------------//

export const crearAnimal = async (req, res, next) => {
  const archivos = req.files ?? [];
  let confirmado = false;
  let client;

  try {
    if (!esObjetoJson(req.body)) return error400(res, "El cuerpo debe ser un objeto JSON válido");

    const body = normalizarBody(req.body, { alCrear: true });
    // El estado inicial lo decide el servidor, no el cliente
    delete body.estado;

    const { datos, error } = validarDatosAnimal(body, { alCrear: true });
    if (error) return res.status(400).json({ success: false, error });

    if (archivos.length === 0) return error400(res, "Debes subir al menos una foto");

    datos.usuario_id = req.usuario.id;

    client = await pool.connect();
    await client.query("BEGIN");

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
    const animalCreado = rows[0];

    animalCreado.fotos = [];
    for (let i = 0; i < archivos.length; i++) {
      const imagenUrl = `/uploads/${archivos[i].filename}`;
      const foto = await client.query(
          "INSERT INTO foto_animales (animal_id, imagen_url, orden) VALUES ($1, $2, $3) RETURNING id, imagen_url, orden",
          [animalCreado.id, imagenUrl, i + 1]
      );
      animalCreado.fotos.push(foto.rows[0]);
    }

    await client.query("COMMIT");
    confirmado = true;

    return res.status(201).json({ success: true, message: "Animal creado correctamente", data: animalCreado });
  } catch (error) {
    if (client) await client.query("ROLLBACK").catch(() => {});
    if (error.code === "23503") return error400(res, "El usuario indicado no existe");
    return next(error);
  } finally {
    if (client) client.release();
    // Si no se guardó, las fotos subidas no deben quedar sueltas en el disco
    if (!confirmado) await descartarArchivos(archivos);
  }
};

//---------------------------------------------------------------------------------------------------//
// GET /api/animales: catálogo público (en adopción y en proceso; los adoptados no se muestran)
//---------------------------------------------------------------------------------------------------//

export const getAnimales = async (req, res, next) => {
  try {
    const query = `
      SELECT
        a.id, a.nombre, a.especie, a.edad, a.edad_meses, a.sexo, a.tamanho,
        a.ciudad, a.estado, a.descripcion, a.etiquetas, a.usuario_id, a.creado_en,
        f.imagen_url AS imagen_portada
      FROM animales a
             LEFT JOIN foto_animales f ON a.id = f.animal_id AND f.orden = 1
      WHERE a.estado IN ('EN_ADOPCION', 'EN_TRATAMIENTO')
      ORDER BY a.id DESC;
    `;
    const { rows } = await pool.query(query);
    return res.status(200).json({ success: true, message: "Lista de animales obtenida", data: rows });
  } catch (error) {
    return next(error);
  }
};

//---------------------------------------------------------------------------------------------------//
// GET /api/animales/mios: publicaciones del usuario, en cualquier estado.
// El ADMIN puede pedir todas con ?todos=true.
//---------------------------------------------------------------------------------------------------//

export const getMisAnimales = async (req, res, next) => {
  try {
    const todos = req.usuario.rol === "ADMIN" && req.query.todos === "true";
    const valores = todos ? [] : [req.usuario.id];

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
       ${todos ? "" : "WHERE a.usuario_id = $1"}
       ORDER BY a.id DESC`,
        valores
    );

    return res.status(200).json({ success: true, message: "Publicaciones obtenidas", data: rows });
  } catch (error) {
    return next(error);
  }
};

//---------------------------------------------------------------------------------------------------//
// GET /api/animales/:id: un animal adoptado solo lo ve su dueño o un admin
//---------------------------------------------------------------------------------------------------//

export const getAnimalPorId = async (req, res, next) => {
  const id = obtenerIdValido(req.params.id);
  if (id === null) return error400(res, "El id debe ser un número entero");

  try {
    const { rows: animalRows } = await pool.query("SELECT * FROM animales WHERE id = $1", [id]);
    const animal = animalRows[0];

    const puedeVerlo =
        req.usuario && (req.usuario.rol === "ADMIN" || Number(animal?.usuario_id) === req.usuario.id);

    if (!animal || (animal.estado === "ADOPTADO" && !puedeVerlo)) {
      return res.status(404).json({ success: false, error: { message: "Animal no encontrado" } });
    }

    const { rows: fotoRows } = await pool.query(
        "SELECT id, imagen_url, orden FROM foto_animales WHERE animal_id = $1 ORDER BY orden ASC",
        [id]
    );

    animal.fotos = fotoRows;
    return res.status(200).json({ success: true, message: "Animal obtenido correctamente", data: animal });
  } catch (error) {
    return next(error);
  }
};

//---------------------------------------------------------------------------------------------------//
// PATCH /api/animales/:id
// Acepta JSON o multipart. Para las fotos:
//   fotos_conservar = "12,15,9"  ids de las fotos que se quedan, en el orden deseado
//                     (si no se envía, se conservan todas)
//   fotos           = archivos nuevos, se agregan al final
// El total debe quedar entre 1 y 5.
//---------------------------------------------------------------------------------------------------//

export const actualizarAnimal = async (req, res, next) => {
  const archivos = req.files ?? [];
  let confirmado = false;
  let client;
  let fotosABorrar = [];

  try {
    const id = obtenerIdValido(req.params.id);
    if (id === null) return error400(res, "El id debe ser un número entero");

    if (!esObjetoJson(req.body)) return error400(res, "El cuerpo debe ser un objeto JSON");

    // ids de fotos a conservar (undefined = no tocar las existentes)
    let idsConservar;
    if (req.body.fotos_conservar !== undefined) {
      const lista = Array.isArray(req.body.fotos_conservar)
          ? req.body.fotos_conservar
          : String(req.body.fotos_conservar).split(",").filter((t) => t.trim() !== "");
      idsConservar = lista.map(Number);
      if (
          idsConservar.some((n) => !Number.isInteger(n) || n <= 0) ||
          new Set(idsConservar).size !== idsConservar.length
      ) {
        return error400(res, "fotos_conservar debe ser una lista de ids sin repetir");
      }
    }

    const body = normalizarBody(req.body);
    delete body.fotos_conservar;

    const tocaFotos = idsConservar !== undefined || archivos.length > 0;
    if (Object.keys(body).length === 0 && !tocaFotos) return error400(res, "Debes enviar campos para actualizar");

    let datos = {};
    if (Object.keys(body).length > 0) {
      const resultado = validarDatosAnimal(body);
      if (resultado.error) return res.status(400).json({ success: false, error: resultado.error });
      datos = resultado.datos;
    }

    client = await pool.connect();
    await client.query("BEGIN");

    // Bloquea el animal mientras se edita, para que dos ediciones no se pisen
    const existente = await client.query("SELECT id, usuario_id FROM animales WHERE id = $1 FOR UPDATE", [id]);
    if (existente.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ success: false, error: { message: "Animal no encontrado" } });
    }
    if (req.usuario.rol !== "ADMIN" && Number(existente.rows[0].usuario_id) !== req.usuario.id) {
      await client.query("ROLLBACK");
      return res.status(403).json({ success: false, error: { message: "No tienes permiso para modificar este animal" } });
    }

    const columnas = Object.keys(datos);
    if (columnas.length > 0) {
      const cambios = columnas.map((campo, i) => `${campo} = $${i + 1}`).join(", ");
      await client.query(`UPDATE animales SET ${cambios} WHERE id = $${columnas.length + 1}`, [
        ...columnas.map((campo) => datos[campo]),
        id,
      ]);
    }

    if (tocaFotos) {
      const { rows: actuales } = await client.query(
          "SELECT id, imagen_url FROM foto_animales WHERE animal_id = $1",
          [id]
      );
      const conservar = idsConservar ?? actuales.map((f) => f.id);

      if (!conservar.every((fid) => actuales.some((f) => f.id === fid))) {
        await client.query("ROLLBACK");
        return error400(res, "Alguna foto indicada no pertenece a este animal");
      }

      const total = conservar.length + archivos.length;
      if (total < 1 || total > MAX_FOTOS) {
        await client.query("ROLLBACK");
        return error400(res, `El animal debe tener entre 1 y ${MAX_FOTOS} fotos (quedarían ${total})`);
      }

      const quitar = actuales.filter((f) => !conservar.includes(f.id));
      if (quitar.length > 0) {
        await client.query("DELETE FROM foto_animales WHERE id = ANY($1::int[])", [quitar.map((f) => f.id)]);
      }
      fotosABorrar = quitar.map((f) => f.imagen_url);

      for (let i = 0; i < conservar.length; i++) {
        await client.query("UPDATE foto_animales SET orden = $1 WHERE id = $2", [i + 1, conservar[i]]);
      }
      for (let i = 0; i < archivos.length; i++) {
        await client.query(
            "INSERT INTO foto_animales (animal_id, imagen_url, orden) VALUES ($1, $2, $3)",
            [id, `/uploads/${archivos[i].filename}`, conservar.length + i + 1]
        );
      }
    }

    await client.query("COMMIT");
    confirmado = true;

    // Solo tras confirmar se borran del disco las fotos quitadas
    await borrarFotosDelDisco(fotosABorrar);

    const { rows } = await pool.query("SELECT * FROM animales WHERE id = $1", [id]);
    const { rows: fotos } = await pool.query(
        "SELECT id, imagen_url, orden FROM foto_animales WHERE animal_id = $1 ORDER BY orden ASC",
        [id]
    );
    rows[0].fotos = fotos;

    return res.status(200).json({ success: true, message: "Animal actualizado correctamente", data: rows[0] });
  } catch (error) {
    if (client) await client.query("ROLLBACK").catch(() => {});
    return next(error);
  } finally {
    if (client) client.release();
    if (!confirmado) await descartarArchivos(archivos);
  }
};

//---------------------------------------------------------------------------------------------------//
// DELETE /api/animales/:id: el dueño o un admin, en cualquier estado. Borra también las fotos del disco.
//---------------------------------------------------------------------------------------------------//

export const eliminarAnimal = async (req, res, next) => {
  const id = obtenerIdValido(req.params.id);
  if (id === null) return error400(res, "El id debe ser un número entero");

  try {
    const existente = await pool.query("SELECT id, usuario_id FROM animales WHERE id = $1", [id]);
    if (existente.rows.length === 0) {
      return res.status(404).json({ success: false, error: { message: "Animal no encontrado" } });
    }

    if (req.usuario.rol !== "ADMIN" && Number(existente.rows[0].usuario_id) !== req.usuario.id) {
      return res.status(403).json({ success: false, error: { message: "No tienes permiso para eliminar este animal" } });
    }

    // Las fotos se leen antes, porque el ON DELETE CASCADE borra sus filas junto con el animal
    const { rows: fotos } = await pool.query("SELECT imagen_url FROM foto_animales WHERE animal_id = $1", [id]);

    const { rows } = await pool.query("DELETE FROM animales WHERE id = $1 RETURNING *", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: { message: "Animal no encontrado" } });
    }

    await borrarFotosDelDisco(fotos.map((f) => f.imagen_url));

    return res.status(200).json({ success: true, message: "Animal eliminado correctamente", data: rows[0] });
  } catch (error) {
    return next(error);
  }
};