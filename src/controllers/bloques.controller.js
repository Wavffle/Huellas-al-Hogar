import * as bloquesService from "../services/bloques.service.js";

// GET /api/bloques-contenido  (filtro opcional: ?seccion=CUIDADOS)
export const getBloques = async (req, res, next) => {
  try {
    const bloques = await bloquesService.listarBloques(req.query);
    return res.status(200).json({
      success: true,
      message: "Bloques de contenido obtenidos correctamente",
      data: bloques,
    });
  } catch (error) {
    return next(error);
  }
};
