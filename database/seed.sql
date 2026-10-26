-- Cuentas de PRUEBA para la evaluación. No usar en un despliegue real.
-- Ejecutar DESPUÉS de schema.sql:  psql -U postgres -d huellas-al-hogar -f database/seed.sql
-- Es seguro repetirlo: si las cuentas ya existen, se restablecen su contraseña, nombre y rol.
--
--   admin@huellas.test        Admin1234     (ADMIN)
--   rescatista@huellas.test   Rescata1234   (RESCATISTA)
--   adoptante@huellas.test    Adopta1234    (ADOPTANTE)

INSERT INTO usuarios (correo, password_hash, nombre, rol) VALUES
  ('admin@huellas.test',      '$2b$12$PSYCFWpefNx44GbyvsneU.8.Fdt9xGCkHEhbC7QGNkgRtCIipPLP.', 'Admin Prueba',      'ADMIN'),
  ('rescatista@huellas.test', '$2b$12$bwNgUh2a7Px6mx5yaw5Slu/VsInzMGXYVr8jIC5VFGNF96Y/xMh6W', 'Rescatista Prueba', 'RESCATISTA'),
  ('adoptante@huellas.test',  '$2b$12$FDoCs2EcSNRrLPFN.YaYyur7hcwyG2Xxx7/sxAWQQGWty.2Yb/4hu', 'Adoptante Prueba',  'ADOPTANTE')
ON CONFLICT (correo) DO UPDATE
  SET password_hash = EXCLUDED.password_hash,
      nombre = EXCLUDED.nombre,
      rol = EXCLUDED.rol;
