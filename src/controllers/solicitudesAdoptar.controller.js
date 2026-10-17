import { animalesPrueba } from "../dataTest/animalesTest.js";
import { solicitudesPrueba } from "../dataTest/solicitudesTest.js";

//---------------------------------------------------------------------------------------------------//
// funciones auxiliares //

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

function obtenerSiguienteId() {
  return solicitudesPrueba.reduce(
    (mayorId, solicitud) => Math.max(mayorId, solicitud.id),
    0
  ) + 1;
}

//---------------------------------------------------------------------------------------------------//
// parte para GET de las solicitudes //

export const getSolicitudes = (req, res) => {
  const { animal_id, usuario_id, estado } = req.query;

  let animalIdBuscado;
  let usuarioIdBuscado;

  if (animal_id !== undefined) {
    animalIdBuscado = obtenerIdValido(animal_id);

    if (animalIdBuscado === null) {
      return res.status(400).json({
        success: false,
        error: {
          message: "animal_id debe ser un número entero positivo",
        },
      });
    }
  }

  if (usuario_id !== undefined) {
    usuarioIdBuscado = obtenerIdValido(usuario_id);

    if (usuarioIdBuscado === null) {
      return res.status(400).json({
        success: false,
        error: {
          message: "usuario_id debe ser un número entero positivo",
        },
      });
    }
  }

  if (estado !== undefined && !estadosPermitidos.includes(estado)) {
    return res.status(400).json({
      success: false,
      error: {
        message: "El estado de la solicitud no es válido",
        allowedValues: estadosPermitidos,
      },
    });
  }

  const resultado = solicitudesPrueba.filter((solicitud) => {
    return (
      (animalIdBuscado === undefined ||
        solicitud.animal_id === animalIdBuscado) &&
      (usuarioIdBuscado === undefined ||
        solicitud.usuario_id === usuarioIdBuscado) &&
      (estado === undefined || solicitud.estado === estado)
    );
  });

  return res.status(200).json({
    success: true,
    message: "Solicitudes obtenidas correctamente",
    data: resultado,
  });
};

//---------------------------------------------------------------------------------------------------//
// parte para GET de una solicitud por id //

export const getSolicitudPorId = (req, res) => {
  const id = obtenerIdValido(req.params.id);

  if (id === null) {
    return res.status(400).json({
      success: false,
      error: {
        message: "El id debe ser un número entero positivo",
      },
    });
  }

  const solicitud = solicitudesPrueba.find(
    (item) => item.id === id
  );

  if (!solicitud) {
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
    data: solicitud,
  });
};

//---------------------------------------------------------------------------------------------------//
// parte para POST, o sea para crear solicitudes de adopcion //

export const crearSolicitud = (req, res) => {
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

  // Temporal para las pruebas.
  // Más adelante, usuario_id se obtendrá del JWT.
  if (usuarioId === null) {
    return res.status(400).json({
      success: false,
      error: {
        message: "usuario_id es obligatorio y debe ser un entero positivo",
      },
    });
  }

  let notas = null;

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

  // Busca el animal al que corresponde la solicitud.
  const animal = animalesPrueba.find(
    (item) => item.id === animalId
  );

  if (!animal) {
    return res.status(404).json({
      success: false,
      error: {
        message: "Animal no encontrado",
      },
    });
  }

  if (animal.estado !== "EN_ADOPCION") {
    return res.status(409).json({
      success: false,
      error: {
        message: "El animal no está disponible para postular",
      },
    });
  }

  // No permite solicitudes pendientes duplicadas del mismo usuario
  // para el mismo animal. Usuarios distintos sí pueden postular.
  const yaExisteSolicitudPendiente = solicitudesPrueba.some(
    (item) =>
      item.animal_id === animalId &&
      item.usuario_id === usuarioId &&
      item.estado === "PENDIENTE"
  );

  if (yaExisteSolicitudPendiente) {
    return res.status(409).json({
      success: false,
      error: {
        message: "Ya existe una solicitud pendiente para este animal",
      },
    });
  }

  const solicitud = {
    id: obtenerSiguienteId(),
    estado: "PENDIENTE",
    notas,
    creado_en: new Date().toISOString(),
    usuario_id: usuarioId,
    animal_id: animalId,
  };

  solicitudesPrueba.push(solicitud);

  return res.status(201).json({
    success: true,
    message: "Solicitud creada correctamente",
    data: solicitud,
  });
};

//---------------------------------------------------------------------------------------------------//
// parte para PATCH de las solicitudes ya existentes //

export const actualizarSolicitud = (req, res) => {
  const id = obtenerIdValido(req.params.id);

  if (id === null) {
    return res.status(400).json({
      success: false,
      error: {
        message: "El id debe ser un número entero positivo",
      },
    });
  }

  const solicitud = solicitudesPrueba.find(
    (item) => item.id === id
  );

  if (!solicitud) {
    return res.status(404).json({
      success: false,
      error: {
        message: "Solicitud no encontrada",
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

  const transiciones = transicionesPermitidas[solicitud.estado];

  if (!transiciones || !transiciones.includes(body.estado)) {
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
    const animal = animalesPrueba.find(
      (item) => item.id === solicitud.animal_id
    );

    if (!animal || animal.estado !== "EN_ADOPCION") {
      return res.status(409).json({
        success: false,
        error: {
          message: "El animal ya no está disponible",
        },
      });
    }

    animal.estado = "ADOPTADO";

    // Al aprobar una solicitud, rechaza las pendientes
    // de otros usuarios para el mismo animal.
    for (const otraSolicitud of solicitudesPrueba) {
      if (
        otraSolicitud.id !== solicitud.id &&
        otraSolicitud.animal_id === solicitud.animal_id &&
        otraSolicitud.estado === "PENDIENTE"
      ) {
        otraSolicitud.estado = "RECHAZADA";
      }
    }
  }

  solicitud.estado = body.estado;

  return res.status(200).json({
    success: true,
    message: "Solicitud actualizada correctamente",
    data: solicitud,
  });
};

//---------------------------------------------------------------------------------------------------//
// parte para DELETE de las solicitudes, dificil dar uso a esta si porq la idea es guardar un registro yo creo //

export const eliminarSolicitud = (req, res) => {
  const id = obtenerIdValido(req.params.id);

  if (id === null) {
    return res.status(400).json({
      success: false,
      error: {
        message: "El id debe ser un número entero positivo",
      },
    });
  }

  const indice = solicitudesPrueba.findIndex(
    (item) => item.id === id
  );

  if (indice === -1) {
    return res.status(404).json({
      success: false,
      error: {
        message: "Solicitud no encontrada",
      },
    });
  }

  const [solicitudEliminada] = solicitudesPrueba.splice(indice, 1);

  return res.status(200).json({
    success: true,
    message: "Solicitud eliminada correctamente",
    data: solicitudEliminada,
  });
};

//---------------------------------------------------------------------------------------------------//