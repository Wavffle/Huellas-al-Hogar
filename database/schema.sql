-- Creación de Tipos ENUM
CREATE TYPE rol_usuario AS ENUM ('ADMIN', 'RESCATISTA', 'ADOPTANTE');
CREATE TYPE estado_solicitud AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA');
CREATE TYPE estado_animal AS ENUM ('EN_ADOPCION', 'ADOPTADO', 'EN_TRATAMIENTO');

-- Tabla Usuario
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    correo VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    numero_telefono VARCHAR(20),
    rol rol_usuario NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla Animal
CREATE TABLE animales (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    especie VARCHAR(50) NOT NULL,
    edad INT,
    sexo VARCHAR(20),
    tamanho VARCHAR(20),
    estado_salud TEXT,
    estado estado_animal DEFAULT 'EN_ADOPCION',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_id INT NOT NULL,
    CONSTRAINT fk_usuario_animal FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabla SolicitudAdopcion
CREATE TABLE solicitudes_adopcion (
    id SERIAL PRIMARY KEY,
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
