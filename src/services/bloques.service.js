import { pool } from "../config/database.js";
import { ErrorHttp } from "../utils/errores.js";

// Debe coincidir con el tipo seccion_contenido de database/schema.sql
const secciones = ["CUIDADOS", "PREGUNTAS", "NECESIDADES", "ESTADISTICAS", "FUENTE", "CONSECUENCIAS", "ACCIONES"];

/**
 * Bloques de contenido de las páginas educativas, en el orden en que se muestran.
 * Filtro opcional: ?seccion= (sin distinguir mayúsculas). Un filtro vacío se ignora.
 */
export async function listarBloques(query = {}) {
  const valores = [];
  let filtro = "";

  if (query.seccion !== undefined) {
    if (typeof query.seccion !== "string") {
      throw new ErrorHttp(400, "La sección debe enviarse una sola vez y como texto");
    }

    const seccion = query.seccion.trim().toUpperCase();
    if (seccion !== "") {
      if (!secciones.includes(seccion)) {
        throw new ErrorHttp(400, "La sección no es válida", { allowedValues: secciones });
      }
      valores.push(seccion);
      filtro = "WHERE seccion = $1";
    }
  }

  const { rows } = await pool.query(
    `SELECT id, seccion, orden, titulo, texto, destacado, imagen, alt
     FROM bloques_contenido
     ${filtro}
     ORDER BY seccion, orden`,
    valores
  );
  return rows;
}
