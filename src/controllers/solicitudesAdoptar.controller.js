import * as solicitudesService from "../services/solicitudes.service.js";

// Los controladores solo traducen HTTP: leen la petición, llaman al servicio y arman la respuesta.
// La lógica de negocio y las consultas SQL viven en services/solicitudes.service.js

// GET /api/solicitudes
export const getSolicitudes = async (req, res, next) => {
  try {
    const solicitudes = await solicitudesService.listarSolicitudes(req.usuario, req.query);
    return res.status(200).json({ success: true, message: "Solicitudes obtenidas correctamente", data: solicitudes });
  } catch (error) {
    return next(error);
  }
};

// GET /api/solicitudes/:id
export const getSolicitudPorId = async (req, res, next) => {
  try {
    const solicitud = await solicitudesService.obtenerSolicitud(req.params.id, req.usuario);
    return res.status(200).json({ success: true, message: "Solicitud obtenida correctamente", data: solicitud });
  } catch (error) {
    return next(error);
  }
};

// POST /api/solicitudes
export const crearSolicitud = async (req, res, next) => {
  try {
    const solicitud = await solicitudesService.crearSolicitud(req.usuario, req.body);
    return res.status(201).json({ success: true, message: "Solicitud creada correctamente", data: solicitud });
  } catch (error) {
    return next(error);
  }
};

// PATCH /api/solicitudes/:id  { "estado": "APROBADA" | "RECHAZADA" }
export const actualizarSolicitud = async (req, res, next) => {
  try {
    const solicitud = await solicitudesService.cambiarEstadoSolicitud(req.params.id, req.usuario, req.body);
    return res.status(200).json({ success: true, message: "Solicitud actualizada correctamente", data: solicitud });
  } catch (error) {
    return next(error);
  }
};

// DELETE /api/solicitudes/:id
export const eliminarSolicitud = async (req, res, next) => {
  try {
    const solicitud = await solicitudesService.eliminarSolicitud(req.params.id);
    return res.status(200).json({ success: true, message: "Solicitud eliminada correctamente", data: solicitud });
  } catch (error) {
    return next(error);
  }
};
