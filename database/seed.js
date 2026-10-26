import "dotenv/config";
import bcrypt from "bcrypt";
import { pool } from "../src/config/database.js";

// Cuentas de PRUEBA.
const cuentas = [
    { nombre: "Admin Prueba", correo: "admin@huellas.test", password: "Admin1234", rol: "ADMIN" },
    { nombre: "Rescatista Prueba", correo: "rescatista@huellas.test", password: "Rescata1234", rol: "RESCATISTA" },
    { nombre: "Adoptante Prueba", correo: "adoptante@huellas.test", password: "Adopta1234", rol: "ADOPTANTE" },
];

try {
    for (const c of cuentas) {
        const hash = await bcrypt.hash(c.password, 12);
        // Si la cuenta ya existe, se restablecen su contraseña, nombre y rol
        await pool.query(
            `INSERT INTO usuarios (correo, password_hash, nombre, rol)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (correo) DO UPDATE
         SET password_hash = EXCLUDED.password_hash,
             nombre = EXCLUDED.nombre,
             rol = EXCLUDED.rol`,
            [c.correo, hash, c.nombre, c.rol]
        );
        console.log(`✔ ${c.rol.padEnd(10)} ${c.correo}  (contraseña: ${c.password})`);
    }
} catch (error) {
    console.error("No se pudieron crear las cuentas:", error.message);
    process.exitCode = 1;
} finally {
    await pool.end();
}