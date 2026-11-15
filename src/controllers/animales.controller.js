import * as animalesService from "../services/animales.service.js";

// Los controladores solo traducen HTTP: leen la petición, llaman al servicio y arman la respuesta.
// La lógica de negocio y las consultas SQL viven en services/animales.service.js

// POST /api/animales
export const crearAnimal = async (req, res, next) => {
  try {
    const animal = await animalesService.crearAnimal(req.usuario, req.body, req.files ?? []);
    return res.status(201).json({ success: true, message: "Animal creado correctamente", data: animal });
  } catch (error) {
    return next(error);
  }
};

// GET /api/animales  (filtros opcionales: ?especie=, ?ciudad=, ?tamanho=)
export const getAnimales = async (req, res, next) => {
  try {
    const animales = await animalesService.listarAnimales(req.query);
    return res.status(200).json({ success: true, message: "Lista de animales obtenida", data: animales });
  } catch (error) {
    return next(error);
  }
};

// GET /api/animales/mios  (el ADMIN puede pedir todas con ?todos=true)
export const getMisAnimales = async (req, res, next) => {
  try {
    const animales = await animalesService.listarMisAnimales(req.usuario, {
      todos: req.query.todos === "true",
    });
    return res.status(200).json({ success: true, message: "Publicaciones obtenidas", data: animales });
  } catch (error) {
    return next(error);
  }
};

// GET /api/animales/:id
export const getAnimalPorId = async (req, res, next) => {
  try {
    const animal = await animalesService.obtenerAnimal(req.params.id, req.usuario);
    return res.status(200).json({ success: true, message: "Animal obtenido correctamente", data: animal });
  } catch (error) {
    return next(error);
  }
};

// PATCH /api/animales/:id  (JSON o multipart con fotos)
export const actualizarAnimal = async (req, res, next) => {
  try {
    const animal = await animalesService.actualizarAnimal(req.params.id, req.usuario, req.body, req.files ?? []);
    return res.status(200).json({ success: true, message: "Animal actualizado correctamente", data: animal });
  } catch (error) {
    return next(error);
  }
};

// DELETE /api/animales/:id
export const eliminarAnimal = async (req, res, next) => {
  try {
    const animal = await animalesService.eliminarAnimal(req.params.id, req.usuario);
    return res.status(200).json({ success: true, message: "Animal eliminado correctamente", data: animal });
  } catch (error) {
    return next(error);
  }
};
