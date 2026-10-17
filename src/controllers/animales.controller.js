
import { animalesPrueba } from "../dataTest/animalesTest.js";
import { solicitudesPrueba } from "../dataTest/solicitudesTest.js";

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

function obtenerSiguienteId() {
  return animalesPrueba.reduce(
    (mayorId, animal) => Math.max(mayorId, animal.id),
    0
  ) + 1;
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

export const crearAnimal = (req, res) => {
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

  const animal = {
    id: obtenerSiguienteId(),
    ...datos,
    creado_en: new Date().toISOString(),
  };

  animalesPrueba.push(animal);

  return res.status(201).json({
    success: true,
    message: "Animal creado correctamente",
    data: animal,
  });
};

//---------------------------------------------------------------------------------------------------//
// parte para GET en animales //

export const getAnimales = (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Lista de animales obtenida correctamente",
    data: animalesPrueba,
  });
};

export const getAnimalPorId = (req, res) => {
  const id = obtenerIdValido(req.params.id);

  if (id === null) {
    return res.status(400).json({
      success: false,
      error: {
        message: "El id debe ser un número entero positivo",
      },
    });
  }

  const animal = animalesPrueba.find(
    (item) => item.id === id
  );

  if (!animal) {
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
    data: animal,
  });
};

//---------------------------------------------------------------------------------------------------//
// parte para PATCH en animales, o sea actualizar la info //

export const actualizarAnimal = (req, res) => {
  const id = obtenerIdValido(req.params.id);

  if (id === null) {
    return res.status(400).json({
      success: false,
      error: {
        message: "El id debe ser un número entero positivo",
      },
    });
  }

  const animal = animalesPrueba.find(
    (item) => item.id === id
  );

  if (!animal) {
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

  Object.assign(animal, datos);

  return res.status(200).json({
    success: true,
    message: "Animal actualizado correctamente",
    data: animal,
  });
};

//---------------------------------------------------------------------------------------------------//
// parte para DELETE en animales //

export const eliminarAnimal = (req, res) => {
  const id = obtenerIdValido(req.params.id);

  if (id === null) {
    return res.status(400).json({
      success: false,
      error: {
        message: "El id debe ser un número entero positivo",
      },
    });
  }

  const indice = animalesPrueba.findIndex(
    (item) => item.id === id
  );

  if (indice === -1) {
    return res.status(404).json({
      success: false,
      error: {
        message: "Animal no encontrado",
      },
    });
  }

  const [animalEliminado] = animalesPrueba.splice(indice, 1);

  // Simula ON DELETE CASCADE de solicitudes_adopcion.
  for (let i = solicitudesPrueba.length - 1; i >= 0; i--) {
    if (solicitudesPrueba[i].animal_id === id) {
      solicitudesPrueba.splice(i, 1);
    }
  }

  return res.status(200).json({
    success: true,
    message: "Animal eliminado correctamente",
    data: animalEliminado,
  });
};

//---------------------------------------------------------------------------------------------------//