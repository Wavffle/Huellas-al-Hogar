
import { pool } from "../config/database.js";
//---------------------------------------------------------------------------------------------------//
//no mucha ciencia en este, total es contenido educativo de "extra"
// funciones auxiliares //

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

function validarContenido(body, { alCrear = false } = {}) {
  const camposPermitidos = alCrear
    ? ["titulo", "categoria", "contenido", "usuario_id"]
    : ["titulo", "categoria", "contenido"];

  const camposDesconocidos = Object.keys(body).filter(
    (campo) => !camposPermitidos.includes(campo)
  );

  if (camposDesconocidos.length > 0) {
    return {
      error: {
        message: "Hay campos que no se permiten en esta operación",
        fields: camposDesconocidos,
      },
    };
  }

  const datos = {};
  const camposInvalidos = [];

  const limites = {
    titulo: 150,
    categoria: 100,
  };

  for (const campo of ["titulo", "categoria", "contenido"]) {
    if (body[campo] === undefined) {
      if (alCrear) camposInvalidos.push(campo);
      continue;
    }

    if (
      typeof body[campo] !== "string" ||
      body[campo].trim().length === 0
    ) {
      camposInvalidos.push(campo);
      continue;
    }

    const valor = body[campo].trim();

    if (limites[campo] && valor.length > limites[campo]) {
      camposInvalidos.push(campo);
      continue;
    }

    datos[campo] = valor;
  }

  if (alCrear) {
    if (!Number.isInteger(body.usuario_id) || body.usuario_id <= 0) {
      camposInvalidos.push("usuario_id");
    } else {
      datos.usuario_id = body.usuario_id;
    }
  }

  if (camposInvalidos.length > 0) {
    return {
      error: {
        message: "Hay campos obligatorios o con un formato inválido",
        fields: [...new Set(camposInvalidos)],
      },
    };
  }

  return { datos };
}

//---------------------------------------------------------------------------------------------------//
// parte para POST de contenidos educativos //

export const crearContenidoEducativo = async (req, res, next) => {
  const body = req.body;

  if (!esObjetoJson(body)) {
    return res.status(400).json({
      success: false,
      error: {
        message: "El cuerpo debe ser un objeto JSON",
      },
    });
  }

  const { datos, error } = validarContenido(body, {
    alCrear: true,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      error,
    });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO contenidos_educativos (titulo, categoria, contenido, usuario_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [datos.titulo, datos.categoria, datos.contenido, datos.usuario_id]
    );

    return res.status(201).json({
      success: true,
      message: "Contenido educativo creado correctamente",
      data: rows[0],
    });
  } catch (error) {
    if (error.code === "23503") {
      return res.status(400).json({
        success: false,
        error: {
          message: "El usuario indicado no existe",
        },
      });
    }

    return next(error);
  }
};

//---------------------------------------------------------------------------------------------------//
// parte para GET de contenidos educativos //

export const getContenidosEducativos = async (req, res, next) => {
  try {
    const { categoria, usuario_id } = req.query;
    const condiciones = [];
    const valores = [];

    if (categoria !== undefined) {
      if (typeof categoria !== "string") {
        return res.status(400).json({
          success: false,
          message: "La categoría no es válida",
        });
      }

      valores.push(categoria.trim());
      condiciones.push(`LOWER(categoria) = LOWER($${valores.length})`);
    }

    if (usuario_id !== undefined) {
      const usuarioIdBuscado = obtenerIdValido(usuario_id);

      if (usuarioIdBuscado === null) {
        return res.status(400).json({
          success: false,
          message: "El usuario_id debe ser un número entero positivo",
        });
      }

      valores.push(usuarioIdBuscado);
      condiciones.push(`usuario_id = $${valores.length}`);
    }

    let consulta = "SELECT * FROM contenidos_educativos";

    if (condiciones.length > 0) {
      consulta += ` WHERE ${condiciones.join(" AND ")}`;
    }

    consulta += " ORDER BY id";

    const { rows } = await pool.query(consulta, valores);

    return res.status(200).json({
      success: true,
      message: "Contenidos educativos obtenidos correctamente",
      data: rows,
    });
  } catch (error) {
    return next(error);
  }
};

export const getContenidoEducativoPorId = async (req, res, next) => {
  try {
    const id = obtenerIdValido(req.params.id);

    if (id === null) {
      return res.status(400).json({
        success: false,
        message: "El id del contenido debe ser un número entero positivo",
      });
    }

    const { rows } = await pool.query(
      "SELECT * FROM contenidos_educativos WHERE id = $1",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Contenido educativo no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Contenido educativo obtenido correctamente",
      data: rows[0],
    });
  } catch (error) {
    return next(error);
  }
};

//---------------------------------------------------------------------------------------------------//
// parte para PATCH de contenidos educativos //

export const actualizarContenidoEducativo = async (req, res, next) => {
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

    const body = req.body;

    if (!esObjetoJson(body)) {
      return res.status(400).json({
        success: false,
        error: {
          message: "El cuerpo debe ser un objeto JSON",
        },
      });
    }

    if (Object.keys(body).length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Debes enviar al menos un campo para actualizar",
        },
      });
    }

    const { datos, error } = validarContenido(body);

    if (error) {
      return res.status(400).json({
        success: false,
        error,
      });
    }

    const campos = Object.keys(datos);
    const asignaciones = campos.map(
      (campo, indice) => `${campo} = $${indice + 1}`
    );
    const valores = campos.map((campo) => datos[campo]);
    valores.push(id);

    const consulta = `
      UPDATE contenidos_educativos
      SET ${asignaciones.join(", ")}
      WHERE id = $${valores.length}
      RETURNING *
    `;

    const { rows } = await pool.query(consulta, valores);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Contenido educativo no encontrado",
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Contenido educativo actualizado correctamente",
      data: rows[0],
    });
  } catch (error) {
    return next(error);
  }
};

//---------------------------------------------------------------------------------------------------//
// parte para DELETE de contenidos educativos //

export const eliminarContenidoEducativo = async (req, res, next) => {
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
      "DELETE FROM contenidos_educativos WHERE id = $1 RETURNING *",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Contenido educativo no encontrado",
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Contenido educativo eliminado correctamente",
      data: rows[0],
    });
  } catch (error) {
    return next(error);
  }
};

//---------------------------------------------------------------------------------------------------//