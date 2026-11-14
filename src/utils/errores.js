/**
 * Error "esperado" de la API (validación, permisos, recurso inexistente, conflicto).
 * Los servicios lo lanzan con `throw` y el manejador global de server.js lo convierte
 * en la respuesta: { success: false, error: { message, ...extra } }.
 *
 * Ejemplo: throw new ErrorHttp(409, "No se permite ese cambio", { estadoActual: "APROBADA" });
 */
export class ErrorHttp extends Error {
  constructor(status, message, extra = {}) {
    super(message);
    this.name = "ErrorHttp";
    this.status = status;
    this.extra = extra;
  }
}
