// constantes para testeo //

const animalesPrueba = [
  {
    id: "cucurucho",
    name: "Cucurucho",
    species: "Perro",
    age: "2 años",
    size: "Mediano",
    sex: "Macho",
    location: "Valparaíso",
    description: "Sociable y enérgico; disfruta los paseos.",
    healthStatus: "Saludable",
    specialCare: [],
    behavior: "Amistoso con las personas",
    history: "Rescatado en Valparaíso",
    status: "En adopción",
    imageUrl: null,
  },
  {
    id: "luna",
    name: "Luna",
    species: "Gata",
    age: "1 año",
    size: "Pequeña",
    sex: "Hembra",
    location: "Viña del Mar",
    description: "Cariñosa y tranquila.",
    healthStatus: "Saludable",
    specialCare: [],
    behavior: "Tranquila y afectuosa",
    history: "Rescatada en Viña del Mar",
    status: "En adopción",
    imageUrl: null,
  },
];

//---------------------------------------------------------------------------------------------------//

import { randomUUID } from "node:crypto"; //import para el id, por cambiar por el tema de base de datos

// parte para el push post no me acuerdo el nombre //

export const crearAnimal = (req, res) => {
  const body = req.body;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return res.status(400).json({
      success: false,
      error: {
        message: "El cuerpo de la solicitud debe ser un objeto JSON",
      },
    });
  }

  const camposObligatorios = [
    "name",
    "species",
    "age",
    "size",
    "sex",
    "location",
    "description",
  ];

  const camposInvalidos = camposObligatorios.filter(
    (campo) =>
      typeof body[campo] !== "string" ||
      body[campo].trim().length === 0
  );

  if (camposInvalidos.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: "Faltan campos obligatorios o están vacíos",
        fields: camposInvalidos,
      },
    });
  }

  if (
    body.specialCare !== undefined &&
    (!Array.isArray(body.specialCare) ||
      body.specialCare.some((item) => typeof item !== "string"))
  ) {
    return res.status(400).json({
      success: false,
      error: {
        message: "specialCare debe ser una lista de textos",
      },
    });
  }

  const animal = {
    id: randomUUID(),
    name: body.name.trim(),
    species: body.species.trim(),
    age: body.age.trim(),
    size: body.size.trim(),
    sex: body.sex.trim(),
    location: body.location.trim(),
    description: body.description.trim(),
    healthStatus:
      typeof body.healthStatus === "string" && body.healthStatus.trim()
        ? body.healthStatus.trim()
        : "No informado",
    specialCare: body.specialCare ?? [],
    behavior:
      typeof body.behavior === "string" && body.behavior.trim()
        ? body.behavior.trim()
        : "No informado",
    history:
      typeof body.history === "string" && body.history.trim()
        ? body.history.trim()
        : "No informado",
    status: "En adopción",
    imageUrl:
      typeof body.imageUrl === "string" && body.imageUrl.trim()
        ? body.imageUrl.trim()
        : null,
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
  res.status(200).json({
    success: true,
    message: "Lista de animales obtenida correctamente",
    data: animalesPrueba,
  });
};

export const getAnimalPorId = (req, res) => {
  const animal = animalesPrueba.find(
    (animal) => animal.id === req.params.id
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

// parte para patch en animales, o sea actualizar la info //

export const actualizarAnimal = (req, res) => {
  const animal = animalesPrueba.find(
    (animal) => animal.id === req.params.id
  );

  if (!animal) {
    return res.status(404).json({
      success: false,
      error: { message: "Animal no encontrado" },
    });
  }

  const body = req.body;
//esto es para el postman, solo para confirmar eso del tipo de objeto nomas
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return res.status(400).json({
      success: false,
      error: { message: "El cuerpo debe ser un objeto JSON" },
    });
  }

  if (Object.keys(body).length === 0) {
    return res.status(400).json({
      success: false,
      error: { message: "Debes enviar al menos un campo para actualizar" },
    });
  }

  const camposTexto = [
    "name",
    "species",
    "age",
    "size",
    "sex",
    "location",
    "description",
    "healthStatus",
    "behavior",
    "history",
    "status",
  ];

  const camposPermitidos = [...camposTexto, "specialCare", "imageUrl"];
  const camposDesconocidos = Object.keys(body).filter(
    (campo) => !camposPermitidos.includes(campo)
  );

  if (camposDesconocidos.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: "Hay campos que no se pueden actualizar",
        fields: camposDesconocidos,
      },
    });
  }
//hace un arreglo con los no validos para cancelar la accion
  const camposInvalidos = camposTexto.filter(
    (campo) =>
      body[campo] !== undefined &&
      (typeof body[campo] !== "string" || body[campo].trim().length === 0)
  );

  if (camposInvalidos.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: "Los campos de texto no pueden estar vacíos",
        fields: camposInvalidos,
      },
    });
  }

  const estadosPermitidos = ["En adopción", "En proceso", "Adoptado"];

  if (
    body.status !== undefined &&
    !estadosPermitidos.includes(body.status)
  ) {
    return res.status(400).json({
      success: false,
      error: {
        message: "El estado del animal no es válido",
        allowedValues: estadosPermitidos,
      },
    });
  }

  if (
    body.specialCare !== undefined &&
    (!Array.isArray(body.specialCare) ||
      body.specialCare.some(
        (item) => typeof item !== "string" || item.trim().length === 0
      ))
  ) {
    return res.status(400).json({
      success: false,
      error: { message: "specialCare debe ser una lista de textos" },
    });
  }

  if (
    body.imageUrl !== undefined &&
    body.imageUrl !== null &&
    (typeof body.imageUrl !== "string" || body.imageUrl.trim().length === 0)
  ) {
    return res.status(400).json({
      success: false,
      error: { message: "imageUrl debe ser un texto o null" },
    });
  }

//quita espacios
  for (const campo of camposTexto) {
    if (body[campo] !== undefined) {
      animal[campo] = body[campo].trim();
    }
  }

  if (body.specialCare !== undefined) {
    animal.specialCare = body.specialCare.map((item) => item.trim());
  }

  if (body.imageUrl !== undefined) {
    animal.imageUrl =
      body.imageUrl === null ? null : body.imageUrl.trim();
  }

  return res.status(200).json({
    success: true,
    message: "Animal actualizado correctamente",
    data: animal,
  });
};

// parte para delete en animales //

export const eliminarAnimal = (req, res) => {
  const indice = animalesPrueba.findIndex(
    (animal) => animal.id === req.params.id
  );

  // cuando es -1 es porque no encontró el id, o sea error y 404
  if (indice === -1) {
    return res.status(404).json({
      success: false,
      error: {
        message: "Animal no encontrado",
      },
    });
  }
// .splice es lo que borra el este
  const [animalEliminado] = animalesPrueba.splice(indice, 1);

  return res.status(200).json({
    success: true,
    message: "Animal eliminado correctamente",
    data: animalEliminado,
  });
};