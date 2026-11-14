import { pool } from "../config/database.js";

/**
 * Ejecuta `trabajo(client)` dentro de una transacción.
 * Si termina bien hace COMMIT; si lanza cualquier error hace ROLLBACK y lo vuelve a lanzar.
 * Siempre libera la conexión.
 */
export async function conTransaccion(trabajo) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const resultado = await trabajo(client);
    await client.query("COMMIT");
    return resultado;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}
