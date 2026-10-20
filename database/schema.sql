-- Creación de Tipos ENUM
CREATE TYPE rol_usuario AS ENUM ('ADMIN', 'RESCATISTA', 'ADOPTANTE');
CREATE TYPE estado_solicitud AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA');
CREATE TYPE estado_animal AS ENUM ('EN_ADOPCION', 'ADOPTADO', 'EN_TRATAMIENTO');
CREATE TYPE tipo_rescate AS ENUM ('RESCATE', 'ENTREGADO_FAMILIA', 'REFUGIO', 'CAMADA');

-- Tabla Usuario
CREATE TABLE usuarios (
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
CREATE TABLE animales (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    especie VARCHAR(50) NOT NULL,
    edad INT,
    edad_meses INT,
    sexo VARCHAR(20) CHECK (sexo IN ('MACHO', 'HEMBRA')),
    tamanho VARCHAR(20) CHECK (tamanho IN ('PEQUEÑO', 'MEDIANO', 'GRANDE', 'PEQUENO')),
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
CREATE TABLE foto_animales (
    id SERIAL PRIMARY KEY,
    animal_id INT NOT NULL,
    imagen_url TEXT NOT NULL,
    orden INT NOT NULL CHECK (orden >= 1 AND orden <= 5),
    CONSTRAINT fk_animal_foto FOREIGN KEY (animal_id) REFERENCES animales(id) ON DELETE CASCADE
);

-- Tabla SolicitudAdopcion
CREATE TABLE solicitudes_adopcion (
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
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_id INT NOT NULL,
    animal_id INT NOT NULL,
    CONSTRAINT fk_usuario_solicitud FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_animal_solicitud FOREIGN KEY (animal_id) REFERENCES animales(id) ON DELETE CASCADE
);

-- Tabla ContenidoEducativo
CREATE TABLE contenidos_educativos (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    contenido TEXT NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_id INT NOT NULL,
    CONSTRAINT fk_usuario_contenido FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
