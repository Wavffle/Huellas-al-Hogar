
import { pool } from "../config/database.js";

//---------------------------------------------------------------------------------------------------//
// funciones auxiliares para testeos, reglas,etc //

const estadosPermitidos = [
  "EN_ADOPCION",
  "ADOPTADO",
  "EN_TRATAMIENTO",
];

const camposTexto = [
  "nombre",
  "especie",
  "sexo",
  "tamanho",
  "estado_salud",
];

const limitesTexto = {
  nombre: 100,
  especie: 50,
  sexo: 20,
  tamanho: 20,
};

const camposObligatoriosAlCrear = ["nombre", "especie"];

const camposPermitidosAlCrear = [
  ...camposTexto,
  "edad",
  "estado",
  "usuario_id",
];

const camposPermitidosAlActualizar = [
  ...camposTexto,
  "edad",
  "estado",
];

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

function validarDatosAnimal(body, { alCrear = false } = {}) {
  const camposPermitidos = alCrear
    ? camposPermitidosAlCrear
    : camposPermitidosAlActualizar;

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

  for (const campo of camposTexto) {
    const esObligatorio =
      alCrear && camposObligatoriosAlCrear.includes(campo);

    if (body[campo] === undefined) {
      if (esObligatorio) {
        camposInvalidos.push(campo);
      }

      continue;
    }

    const puedeSerNull = [
      "sexo",
      "tamanho",
      "estado_salud",
    ].includes(campo);

    if (body[campo] === null && puedeSerNull) {
      datos[campo] = null;
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

    if (limitesTexto[campo] && valor.length > limitesTexto[campo]) {
      camposInvalidos.push(campo);
      continue;
    }

    datos[campo] = valor;
  }

  if (body.edad !== undefined) {
    if (
      body.edad !== null &&
      (!Number.isInteger(body.edad) || body.edad < 0)
    ) {
      camposInvalidos.push("edad");
    } else {
      datos.edad = body.edad;
    }
  } else if (alCrear) {
    datos.edad = null;
  }

  if (body.estado !== undefined) {
    if (!estadosPermitidos.includes(body.estado)) {
      return {
        error: {
          message: "El estado del animal no es válido",
          allowedValues: estadosPermitidos,
        },
      };
    }

    datos.estado = body.estado;
  } else if (alCrear) {
    datos.estado = "EN_ADOPCION";
  }

  if (alCrear) {
    if (!Number.isInteger(body.usuario_id) || body.usuario_id <= 0) {
      camposInvalidos.push("usuario_id");
    } else {
      datos.usuario_id = body.usuario_id;
    }

    for (const campo of ["sexo", "tamanho", "estado_salud"]) {
      if (datos[campo] === undefined) {
        datos[campo] = null;
      }
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
// parte para POST en animales //

export const crearAnimal = async (req, res, next) => {
  const body = req.body;

  if (!esObjetoJson(body)) {
    return res.status(400).json({
      success: false,
      error: {
        message: "El cuerpo debe ser un objeto JSON",
      },
    });
  }

  const { datos, error } = validarDatosAnimal(body, {
    alCrear: true,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      error,
    });
  }
  //de aqui se saca toda la info para el animal, por ahora hacemos todas obligatorias nomas
  try {
    const { rows } = await pool.query(
      `INSERT INTO animales(nombre, especie, edad, sexo, tamanho, estado_salud, estado, usuario_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        datos.nombre,datos.especie,datos.edad,datos.sexo,datos.tamanho,datos.estado_salud,datos.estado,datos.usuario_id,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Animal creado correctamente",
      data: rows[0],
    });
  } catch (error) {
    // PostgreSQL usa 23503 para indicar que falló una clave, asi que es traducirlo a 400 y lkisto
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
// parte para GET en animales //

export const getAnimales = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM animales ORDER BY id"
    );

    return res.status(200).json({
      success: true,
      message: "Lista de animales obtenida correctamente",
      data: rows,
    });
  } catch (error) {
    return next(error);
  }
};

export const getAnimalPorId = async (req, res, next) => {
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
      "SELECT * FROM animales WHERE id = $1", //de aqui saca la id que inserta el que esta buscando
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Animal no encontrado",
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Animal obtenido correctamente",
      data: rows[0],
    });
  } catch (error) {
    return next(error);
  }
};

//---------------------------------------------------------------------------------------------------//
// parte para PATCH en animales, o sea actualizar la info //

export const actualizarAnimal = async (req, res, next) => {
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
    const existente = await pool.query(
      "SELECT id FROM animales WHERE id = $1", //de aqui saca la id, es igual al get practicamente
      [id]
    );

    if (existente.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Animal no encontrado",
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

    const { datos, error } = validarDatosAnimal(body);

    if (error) {
      return res.status(400).json({
        success: false,
        error,
      });
    }

    const columnas = Object.keys(datos);
    const valores = columnas.map((campo) => datos[campo]);
    const cambios = columnas
      .map((campo, indice) => `${campo} = $${indice + 1}`)
      .join(", ");

    const { rows } = await pool.query(
      `UPDATE animales
       SET ${cambios}
       WHERE id = $${columnas.length + 1}
       RETURNING *`,
      [...valores, id]
    );

    return res.status(200).json({
      success: true,
      message: "Animal actualizado correctamente",
      data: rows[0],
    });
  } catch (error) {
    return next(error);
  }
};


//---------------------------------------------------------------------------------------------------//
// parte para DELETE en animales //

export const eliminarAnimal = async (req, res, next) => {
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
      "DELETE FROM animales WHERE id = $1 RETURNING *",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Animal no encontrado",
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Animal eliminado correctamente",
      data: rows[0],
    });
  } catch (error) {
    return next(error);
  }
};

//---------------------------------------------------------------------------------------------------//