import { randomUUID } from "node:crypto";
import { animalesPrueba } from "../dataTest/animalesTest.js";
import { solicitudesPrueba } from "../dataTest/solicitudesTest.js";

const estadosActivos = ["Pendiente", "En revisión"];

//estos son como los estados a los que puede pasar cada una, tipo pendiente puede pasar a revision que ahi es donde se decide si recibe el animal
const transicionesPermitidas = {
  Pendiente: ["En revisión", "Rechazada", "Cancelada"],
  "En revisión": ["Aceptada", "Rechazada", "Cancelada"],
};

// parte para get de las solicitudes //

//este para solicitudes en general
export const getSolicitudes = (req, res) => {
  const { animalId, applicantId, status } = req.query;

  const resultado = solicitudesPrueba.filter((solicitud) => {
    return (
      (!animalId || solicitud.animalId === animalId) &&
      (!applicantId || solicitud.applicantId === applicantId) &&
      (!status || solicitud.status === status)
    );
  });

  return res.status(200).json({
    success: true,
    message: "Solicitudes obtenidas correctamente",
    data: resultado,
  });
};

// este para solicitudes por id
export const getSolicitudPorId = (req, res) => {
  const solicitud = solicitudesPrueba.find(
    (item) => item.id === req.params.id
  );

  if (!solicitud) {
    return res.status(404).json({
      success: false,
      error: { message: "Solicitud no encontrada" },
    });
  }

  return res.status(200).json({
    success: true,
    message: "Solicitud obtenida correctamente",
    data: solicitud,
  });
};

//---------------------------------------------------------------------------------------------------//

// parte para POST, o sea para crearr solicitudes de adopcion //
export const crearSolicitud = (req, res) => {
  const body = req.body;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return res.status(400).json({
      success: false,
      error: { message: "El cuerpo debe ser un objeto JSON" }, //cancelado por cuerpo
    });
  }

  const camposPermitidos = ["animalId", "applicantId", "answers"];
  const camposDesconocidos = Object.keys(body).filter(
    (campo) => !camposPermitidos.includes(campo)
  );

  if (camposDesconocidos.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: "Hay campos no permitidos", //cancelado por campos no permitidos
        fields: camposDesconocidos,
      },
    });
  }

  if (
    typeof body.animalId !== "string" ||
    body.animalId.trim().length === 0
  ) {
    return res.status(400).json({
      success: false,
      error: { message: "animalId es obligatorio" },
    });
  }

  // Temporal para las pruebas después se obtendrá del JWT porque falta eso todavia
  if (
    typeof body.applicantId !== "string" ||
    body.applicantId.trim().length === 0
  ) {
    return res.status(400).json({
      success: false,
      error: { message: "applicantId es obligatorio para estas pruebas" },
    });
  }

  if (
    !body.answers ||
    typeof body.answers !== "object" ||
    Array.isArray(body.answers) ||
    Object.keys(body.answers).length === 0
  ) {
    return res.status(400).json({
      success: false,
      error: { message: "answers debe ser un objeto con respuestas" },
    });
  }

  //aqui recien ya termina de validar y empieza a buscar el animal al que se postula
  const animal = animalesPrueba.find(
    (item) => item.id === body.animalId.trim()
  );

  if (!animal) {
    return res.status(404).json({
      success: false,
      error: { message: "Animal no encontrado" },
    });
  }

  if (animal.status !== "En adopción") {
    return res.status(409).json({
      success: false,
      error: { message: "El animal no está disponible para postular" },
    });
  }

  // y en este se pregunta si es que ya hay una solicitud activa de el mismo (varios distintos users pueden tener una solicitud en cucurucho por ejemplo pero no pueden tener 2 del mismo user)
  const yaExisteSolicitudActiva = solicitudesPrueba.some(
    (item) =>
      item.animalId === animal.id &&
      item.applicantId === body.applicantId.trim() &&
      estadosActivos.includes(item.status)
  );

  if (yaExisteSolicitudActiva) {
    return res.status(409).json({
      success: false,
      error: {
        message: "Ya existe una solicitud activa para este animal",
      },
    });
  }

  //aqui ya es que si se validó que no esté repetida y toma la fecha y todos los valores para guardar la solicitud
  const fechaActual = new Date().toISOString();

  const solicitud = {
    id: randomUUID(),
    animalId: animal.id,
    applicantId: body.applicantId.trim(),
    answers: body.answers,
    status: "Pendiente",
    createdAt: fechaActual,
    updatedAt: fechaActual,
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
  const solicitud = solicitudesPrueba.find(
    (item) => item.id === req.params.id
  );

  if (!solicitud) {
    return res.status(404).json({
      success: false,
      error: { message: "Solicitud no encontrada" }, //no existe el id
    });
  }

  const body = req.body;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return res.status(400).json({
      success: false,
      error: { message: "El cuerpo debe ser un objeto JSON" }, //valida cuerpo
    });
  }

  const campos = Object.keys(body);

  if (campos.length !== 1 || campos[0] !== "status") {
    return res.status(400).json({
      success: false,
      error: { message: "Solo se permite actualizar el estado" },
    });
  }

  const transiciones = transicionesPermitidas[solicitud.status];

  if (!transiciones || !transiciones.includes(body.status)) {
    return res.status(409).json({
      success: false,
      error: {
        message: "No se permite ese cambio de estado",
        currentStatus: solicitud.status,
        allowedStatuses: transiciones ?? [],
      },
    });
  }

  if (body.status === "Aceptada") {
    const animal = animalesPrueba.find(
      (item) => item.id === solicitud.animalId
    );

    if (!animal || animal.status === "Adoptado") {
      return res.status(409).json({
        success: false,
        error: { message: "El animal ya no está disponible" },
      });
    }

    animal.status = "Adoptado";

    // Al aceptar una postulación, las demás solicitudes activas para este se apagan, o sea ya no son vigentes
    for (const otraSolicitud of solicitudesPrueba) {
      if (
        otraSolicitud.id !== solicitud.id &&
        otraSolicitud.animalId === solicitud.animalId &&
        estadosActivos.includes(otraSolicitud.status)
      ) {
        otraSolicitud.status = "Rechazada";
        otraSolicitud.updatedAt = new Date().toISOString();
      }
    }
  }

  solicitud.status = body.status;
  solicitud.updatedAt = new Date().toISOString();

  return res.status(200).json({
    success: true,
    message: "Solicitud actualizada correctamente",
    data: solicitud,
  });
};
//---------------------------------------------------------------------------------------------------//