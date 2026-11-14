import { ErrorHttp } from "./errores.js";

export function esObjetoJson(body) {
  return body !== null && typeof body === "object" && !Array.isArray(body);
}

/** Devuelve el id como entero positivo, o null si no es válido. */
export function obtenerIdValido(valor) {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

/** Igual que obtenerIdValido, pero lanza un 400 con el mensaje indicado si no es válido. */
export function exigirId(valor, mensaje) {
  const id = obtenerIdValido(valor);
  if (id === null) throw new ErrorHttp(400, mensaje);
  return id;
}
