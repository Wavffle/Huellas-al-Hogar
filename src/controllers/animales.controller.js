
import { pool } from "../config/database.js";

//---------------------------------------------------------------------------------------------------//
// funciones auxiliares para testeos, reglas,etc, tambien las constantes que permiten //

const estadosPermitidos = [
  "EN_ADOPCION",
  "ADOPTADO",
  "EN_TRATAMIENTO",
];

const valoresPermitidosPorCampo = {
  sexo: ["MACHO", "HEMBRA"],
  tamanho: ["PEQUEÑO", "PEQUENO", "MEDIANO", "GRANDE"],
  rescate: ["RESCATE", "ENTREGADO_FAMILIA", "REFUGIO", "CAMADA"],
  vacunas_estado: ["AL_DIA", "FALTAN", "NO_TIENE"],
  esterilizado: ["SI", "NO", "NO_SABE"],
};

const camposTexto = [
  "nombre",
  "especie",
  "sexo",
  "tamanho",
  "ciudad",
  "rescate",
  "descripcion",
  "personalidad",
  "vacunas_estado",
  "vacunas_detalles",
  "esterilizado",
  "cuidado_especial",
  "razon_adopcion",
];

const limitesTexto = {
  nombre: 100,
  especie: 50,
  sexo: 20,
  tamanho: 20,
  ciudad: 100,
  vacunas_estado: 20,
  esterilizado: 20,
};

const camposObligatoriosAlCrear = ["nombre", "especie"];
const camposArreglo = ["ideal_para", "convive_con", "etiquetas"];
const camposEnteros = ["edad", "edad_meses"];

// el ... es como pa no poner todo de nuevo nomas

const camposPermitidosAlCrear = [
  ...camposTexto,
  ...camposArreglo,
  ...camposEnteros,
  "fecha_esterilizacion",
  "estado",
  "usuario_id",
];

const camposPermitidosAlActualizar = [
  ...camposTexto,
  ...camposArreglo,
  ...camposEnteros,
  "fecha_esterilizacion",
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

function esFechaIsoValida(valor) {
  if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    return false;
  }

  const fecha = new Date(`${valor}T00:00:00.000Z`);

  return (
    !Number.isNaN(fecha.getTime()) &&
    fecha.toISOString().slice(0, 10) === valor
  );
}

//validar datos como dice valida datos
//o sea saca espacios, las mayus, que este bien escrito todo y que obvio este dentro de los campos permitidos
//la idea tambien es ponerlo en mayus, porq en la base de datos salia que era en mayusculas, quizas no hace falta pero no se pierde nada

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
      } else if (alCrear) {
        datos[campo] = null;
      }

      continue;
    }

    if (body[campo] === null && !esObligatorio) {
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
      if (alCrear) {
        datos[campo] = null;
      }

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
      if (alCrear) {
        datos[campo] = null;
      }

      continue;
    }

    if (body[campo] === null) {
      datos[campo] = null;
      continue;
    }

    if (
      !Array.isArray(body[campo]) ||
      !body[campo].every(
        (valor) => typeof valor === "string" && valor.trim().length > 0
      )
    ) {
      camposInvalidos.push(campo);
      continue;
    }

    datos[campo] = body[campo].map((valor) => valor.trim());
  }

  if (body.fecha_esterilizacion === undefined) {
    if (alCrear) {
      datos.fecha_esterilizacion = null;
    }
  } else if (body.fecha_esterilizacion === null) {
    datos.fecha_esterilizacion = null;
  } else if (!esFechaIsoValida(body.fecha_esterilizacion)) {
    camposInvalidos.push("fecha_esterilizacion");
  } else {
    datos.fecha_esterilizacion = body.fecha_esterilizacion;
  }

  if (body.estado === undefined) {
    if (alCrear) {
      datos.estado = "EN_ADOPCION";
    }
  } else if (body.estado === null) {
    datos.estado = null;
  } else if (!estadosPermitidos.includes(body.estado)) {
    return {
      error: {
        message: "El estado del animal no es válido",
        allowedValues: estadosPermitidos,
      },
    };
  } else {
    datos.estado = body.estado;
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
  //de aqui se saca toda la info para el animal, por ahora hacemos todas obligatorias nomas <- (eso ya cambió, ahora hay opcionales y obligatorios)
  //bien feo pero esto se encarga de recibir todo a la base de datos, igualmente la validacion ya esta hecha entonces aqui llega y recibe
  try {
    const { rows } = await pool.query(
      `INSERT INTO animales (
        nombre, especie, edad, edad_meses, sexo, tamanho, ciudad, rescate,
        descripcion, personalidad, ideal_para, convive_con, etiquetas,
        cuidado_especial, razon_adopcion, vacunas_estado, vacunas_detalles,
        esterilizado, fecha_esterilizacion, estado, usuario_id
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
        $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
      )
      RETURNING *`,
      [
        datos.nombre,datos.especie,datos.edad,datos.edad_meses,datos.sexo,datos.tamanho,datos.ciudad,datos.rescate,datos.descripcion,
        datos.personalidad,datos.ideal_para,datos.convive_con,datos.etiquetas,datos.cuidado_especial,datos.razon_adopcion,datos.vacunas_estado,
        datos.vacunas_detalles,datos.esterilizado,datos.fecha_esterilizacion,datos.estado,datos.usuario_id,
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
