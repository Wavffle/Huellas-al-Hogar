-- =====================================================================
-- Huellas al Hogar · Esquema de la base de datos (PostgreSQL 14+)
--
-- Uso:  psql -U postgres -d huellas-al-hogar -f database/schema.sql
--
-- Es RE-EJECUTABLE: se puede correr cuantas veces se quiera sin errores.
--   · Base nueva: crea los tipos, las tablas y las restricciones.
--   · Base ya creada: no borra nada; solo agrega lo que falte y ajusta
--     las restricciones (sección 3).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Tipos ENUM (CREATE TYPE no admite IF NOT EXISTS, por eso el bloque DO)
-- ---------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE rol_usuario AS ENUM ('ADMIN', 'RESCATISTA', 'ADOPTANTE');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE estado_solicitud AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE estado_animal AS ENUM ('EN_ADOPCION', 'ADOPTADO', 'EN_TRATAMIENTO');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE tipo_rescate AS ENUM ('RESCATE', 'ENTREGADO_FAMILIA', 'REFUGIO', 'CAMADA');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Secciones de las páginas educativas cuyo contenido viene de la base de datos
DO $$ BEGIN
    CREATE TYPE seccion_contenido AS ENUM (
        'CUIDADOS', 'PREGUNTAS', 'NECESIDADES',
        'ESTADISTICAS', 'FUENTE', 'CONSECUENCIAS', 'ACCIONES'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------
-- 2. Tablas
-- ---------------------------------------------------------------------

-- Tabla Usuario
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    correo VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    numero_telefono VARCHAR(20),
    ciudad VARCHAR(100),
    rol rol_usuario NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla Animal
-- tamanho admite un único valor por tamaño: PEQUENO, MEDIANO o GRANDE (sin tilde).
CREATE TABLE IF NOT EXISTS animales (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    especie VARCHAR(50) NOT NULL,
    edad INT,
    edad_meses INT,
    sexo VARCHAR(20) CHECK (sexo IN ('MACHO', 'HEMBRA')),
    tamanho VARCHAR(20),
    ciudad VARCHAR(100),
    rescate tipo_rescate,
    descripcion TEXT,
    personalidad TEXT,
    ideal_para TEXT[],
    convive_con TEXT[],
    etiquetas TEXT[],
    cuidado_especial TEXT,
    razon_adopcion TEXT,
    vacunas_estado VARCHAR(20) CHECK (vacunas_estado IN ('AL_DIA', 'FALTAN', 'NO_TIENE')),
    vacunas_detalles TEXT,
    esterilizado VARCHAR(20) CHECK (esterilizado IN ('SI', 'NO', 'NO_SABE')),
    fecha_esterilizacion DATE,
    estado estado_animal DEFAULT 'EN_ADOPCION',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_id INT NOT NULL,
    CONSTRAINT fk_usuario_animal FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabla FotoAnimal
CREATE TABLE IF NOT EXISTS foto_animales (
    id SERIAL PRIMARY KEY,
    animal_id INT NOT NULL,
    imagen_url TEXT NOT NULL,
    orden INT NOT NULL CHECK (orden >= 1 AND orden <= 5),
    CONSTRAINT fk_animal_foto FOREIGN KEY (animal_id) REFERENCES animales(id) ON DELETE CASCADE
);

-- Tabla SolicitudAdopcion
-- Una persona solo puede postular una vez a cada animal (uq_solicitud_usuario_animal).
CREATE TABLE IF NOT EXISTS solicitudes_adopcion (
    id SERIAL PRIMARY KEY,
    tipo_vivienda VARCHAR(50) NOT NULL,
    tiene_patio BOOLEAN NOT NULL,
    con_quien_convive TEXT NOT NULL,
    tuvo_mascotas BOOLEAN NOT NULL,
    tiene_mascotas BOOLEAN NOT NULL,
    experiencia TEXT,
    motivo TEXT NOT NULL,
    acepta_compromiso BOOLEAN NOT NULL,
    estado estado_solicitud DEFAULT 'PENDIENTE',
    notas TEXT,
    telefono VARCHAR(20),
    ciudad VARCHAR(100),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_id INT NOT NULL,
    animal_id INT NOT NULL,
    CONSTRAINT fk_usuario_solicitud FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_animal_solicitud FOREIGN KEY (animal_id) REFERENCES animales(id) ON DELETE CASCADE,
    CONSTRAINT uq_solicitud_usuario_animal UNIQUE (usuario_id, animal_id)
);

-- Tabla ContenidoEducativo
CREATE TABLE IF NOT EXISTS contenidos_educativos (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    contenido TEXT NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_id INT NOT NULL,
    CONSTRAINT fk_usuario_contenido FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabla BloqueContenido: textos de las páginas "Educación" y "Consecuencias del abandono"
-- (tarjetas, preguntas, estadísticas...). Es contenido de solo lectura para el sitio; se carga
-- con database/seed-contenido.sql. Las imágenes viven en el frontend: `imagen` guarda solo
-- su clave (por ejemplo 'cuidado-salud') y el frontend la traduce al archivo.
CREATE TABLE IF NOT EXISTS bloques_contenido (
    id SERIAL PRIMARY KEY,
    seccion seccion_contenido NOT NULL,
    orden INT NOT NULL CHECK (orden >= 1),
    titulo VARCHAR(150),
    texto TEXT NOT NULL,
    destacado VARCHAR(150),
    imagen VARCHAR(60),
    alt VARCHAR(200),
    CONSTRAINT uq_bloque_seccion_orden UNIQUE (seccion, orden),
    -- destacado es el fragmento del texto que se muestra en negrita
    CONSTRAINT ck_bloque_destacado CHECK (destacado IS NULL OR position(destacado IN texto) > 0)
);

-- ---------------------------------------------------------------------
-- 3. Ajustes para bases creadas con versiones anteriores del esquema.
--    En una base nueva no cambian nada.
-- ---------------------------------------------------------------------

-- 3.1 Columnas de contacto de la solicitud (ya vienen en CREATE TABLE).
ALTER TABLE solicitudes_adopcion ADD COLUMN IF NOT EXISTS telefono VARCHAR(20);
ALTER TABLE solicitudes_adopcion ADD COLUMN IF NOT EXISTS ciudad VARCHAR(100);

-- 3.2 tamanho: un solo valor por tamaño.
--     Las filas con 'PEQUEÑO' pasan a 'PEQUENO' y se reemplaza el CHECK anterior,
--     que aceptaba ambas escrituras. U&'\00D1' es la Ñ, escrita así para que el
--     script no dependa de la codificación del cliente.
DO $$
DECLARE
    r RECORD;
BEGIN
    UPDATE animales SET tamanho = 'PEQUENO' WHERE tamanho = U&'PEQUE\00D1O';

    FOR r IN
        SELECT conname FROM pg_constraint
        WHERE conrelid = 'animales'::regclass
          AND contype = 'c'
          AND pg_get_constraintdef(oid) LIKE '%tamanho%'
    LOOP
        EXECUTE format('ALTER TABLE animales DROP CONSTRAINT %I', r.conname);
    END LOOP;

    ALTER TABLE animales
        ADD CONSTRAINT animales_tamanho_check
        CHECK (tamanho IN ('PEQUENO', 'MEDIANO', 'GRANDE'));
END $$;

-- 3.3 UNIQUE (usuario_id, animal_id) en solicitudes_adopcion.
--     Si la base ya tiene solicitudes repetidas, se avisa en vez de fallar con
--     un error genérico: hay que dejar una sola por (usuario, animal) y volver a ejecutar.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'uq_solicitud_usuario_animal'
          AND conrelid = 'solicitudes_adopcion'::regclass
    ) THEN
        IF EXISTS (
            SELECT 1 FROM solicitudes_adopcion
            GROUP BY usuario_id, animal_id HAVING COUNT(*) > 1
        ) THEN
            RAISE EXCEPTION 'Hay solicitudes repetidas para un mismo (usuario_id, animal_id). Elimine los duplicados y vuelva a ejecutar este archivo.';
        END IF;

        ALTER TABLE solicitudes_adopcion
            ADD CONSTRAINT uq_solicitud_usuario_animal UNIQUE (usuario_id, animal_id);
    END IF;
END $$;
