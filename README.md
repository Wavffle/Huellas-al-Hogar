# Huellas-al-Hogar
Plataforma web y móvil orientada a fomentar la adopción y tenencia responsable de animales, entregando información preventiva sobre el abandono, el cuidado animal y las consecuencias de la proliferación de animales callejeros.

## EP 2.1 — Servidor backend

El backend está desarrollado con Node.js y Express. El punto de entrada del servidor es `src/server.js`. La API utiliza PostgreSQL y escucha en el puerto definido por la variable `PORT`; si no se configura, utiliza el puerto `3000`.

El servidor configura CORS, procesa solicitudes JSON, publica las imágenes almacenadas en `uploads/` y conecta las rutas de animales, solicitudes de adopción, contenidos educativos, autenticación y usuarios. También incluye un manejador de errores inesperados.

Para comprobar el estado del servidor se puede consultar `GET /api/health`. Para comprobar además la conexión con PostgreSQL, se puede consultar `GET /api/health/database`.


# Modelo de base de datos (EP 2.2)
El sistema utiliza una base de datos relacional implementada en PostgreSQL.

### 1. Diagramas de diseño
A continuación se presentan el Modelo Entidad-Relación y el Esquema Relacional del sitio web:

### Modelo Entidad-Relación (MER)
![Modelo Entidad Relación](./docs/merHuellasAlHogar.png)

### Esquema Relacional (Modelo Lógico)
![Esquema Relacional](./docs/erHAH.png)


### 2. Estructura de Tablas y Relaciones
- **usuarios**: Almacena las cuentas registradas con sus credenciales encriptadas (`password_hash`), sus roles (`ADMIN`, `RESCATISTA`, `ADOPTANTE`) y datos de contacto como la `ciudad`.
- **animales**: Guarda la información detallada de las mascotas en adopción (datos de salud, esterilización, tipo de rescate, rasgos de personalidad, etiquetas de compatibilidad y ciudad). Mantiene una relación con la tabla `usuarios` mediante `usuario_id`.
- **foto_animales**: Almacena la galería de imágenes asociadas a cada mascota (con `imagen_url` y `orden` correlativo para gestionar un límite de hasta 5 fotos por animal). Se relaciona directamente con `animales` a través de `animal_id`.
- **solicitudes_adopcion**: Entidad asociativa que conecta a un adoptante (`usuario_id`) con un animal (`animal_id`). Almacena los datos completos del formulario de postulación (tipo de vivienda, patio, experiencia previa, convivencia y motivo de adopción) y realiza el seguimiento del estado de la solicitud (`PENDIENTE`, `APROBADA`, `RECHAZADA`) junto con notas internas de administración.
- **contenidos_educativos**: Publicaciones y artículos informativos creados por usuarios con permisos (`usuario_id`).

Se configuraron las claves primarias, claves foráneas y restricciones para asegurar la consistencia de los datos entre tablas, como la relación de un animal con sus fotografías o con sus solicitudes de adopción.

Se generó y almacenó el archivo .sql en la rama backend del repositorio, el cual contiene la estructura completa para replicar la base de datos localmente.
# Configuración e Instalación Local
### 1. Requisitos Previos
* Node.js v18+ 
* PostgreSQL v14+

### 2. Creación de la Base de Datos
Abre PostgreSQL y crea la base de datos:
```bash
CREATE DATABASE huellas_al_hogar;
```
Luego, para crear la estructura completa de la base de datos (tablas, ENUMs y relaciones), ejecuta el script DDL ubicado en la carpeta `database`, el que se llama `schema.sql`; lo anterior creará las tablas con sus respectivos atributos.

### 3. Configuración del archivo .env
Este archivo es fundamental para que el backend funcione correctamente. Este archivo tiene la siguiente estructura:
```
PGHOST=localhost
PGPORT=5432
PGDATABASE= (nombre de la base de datos que creaste para ejecutar el script schema.sql)
PGUSER=postgres
PGPASSWORD= (la contraseña que usas para acceder a postgres)
JWT_SECRET=HuellasAlHogar2026_ClaveSuperSecreta_Para_El_Proyecto_Final
JWT_EXPIRES_IN=1h
```
Debes reemplazar los valores de PGDATABASE y PGPASSWORD para que el .env funcione. El JWT_SECRET tiene una validación de 32 caracteres o más, por eso es largo y si no lo fuera, el .env no funcionaría. 


### 3. Instalación de dependencias
```bash
npm install
npm install multer
npm run dev
```
Estos comandos se ejecutan dentro de la carpeta del backend (es decir, en la ruta donde se encuentra el archivo package.json). Caso contrario, arrojará error porque no halla qué instalar ni qué ejecutar.

## EP 2.3 — API REST

La API ofrece operaciones para consultar y administrar animales, solicitudes de adopción y contenidos educativos. Las rutas protegidas requieren el encabezado `Authorization: Bearer <token>` (o en el caso de utilizar la herramienta de postman, incluir el token en el apartado de authorization).

### Formato de respuesta

Las respuestas correctas se envían en JSON, con información dentro de `data` cuando corresponde:

```json
{
  "success": true,
  "message": "Operación realizada correctamente",
  "data": {}
}
```

Las respuestas con error usan este formato:

```json
{
  "success": false,
  "error": {
    "message": "Descripción del error"
  }
}
```

### Animales

En todas las rutas que utilizan ":id", este pertenece al id del animal, la solicitud o del contenido educativo pertinente, estos se manejan principalmente con un int generado.

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/animales` | Público | Lista los animales en adopción y en tratamiento. |
| GET | `/api/animales/:id` | Público; token opcional | Obtiene el detalle. Un animal adoptado solo es visible para su dueño o un ADMIN. |
| GET | `/api/animales/mios` | RESCATISTA o ADMIN | Lista las publicaciones del usuario. ADMIN puede usar `?todos=true` para ver todas. |
| POST | `/api/animales` | RESCATISTA o ADMIN | Crea un animal y sus fotos. |
| PATCH | `/api/animales/:id` | Dueño RESCATISTA o ADMIN | Actualiza los datos y/o las fotos. |
| DELETE | `/api/animales/:id` | Dueño RESCATISTA o ADMIN | Elimina el animal y sus fotos. |

Para crear un animal, enviar `multipart/form-data` con los campos del animal definidos en `database/schema.sql` y entre una y cinco fotos en el campo `fotos`. Se permiten imágenes JPG, PNG o WebP de hasta 5 MB cada una. El usuario asociado se obtiene del token que se mencionó al comienzo.

Los campos de lista (`ideal_para`, `convive_con` y `etiquetas`) se pueden enviar como listas separadas por comas cuando se use `multipart/form-data`.

En una edición, `fotos_conservar` puede contener los IDs de las fotos existentes que se mantendrán, separados por comas. Los archivos nuevos se envían en el campo `fotos`; el resultado debe quedar con una a cinco fotos.

### Solicitudes de adopción

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/solicitudes` | Token requerido | ADOPTANTE ve las propias; RESCATISTA ve las recibidas por sus animales; ADMIN ve todas. |
| POST | `/api/solicitudes` | ADOPTANTE o RESCATISTA | Crea una solicitud para un animal disponible. No permite solicitar un animal propio. |
| GET | `/api/solicitudes/:id` | Token requerido | Obtiene una solicitud si pertenece al usuario, al dueño del animal o si quien consulta es ADMIN. |
| PATCH | `/api/solicitudes/:id` | RESCATISTA dueño del animal o ADMIN | Actualiza el estado de la solicitud según las transiciones permitidas. |
| DELETE | `/api/solicitudes/:id` | ADMIN | Elimina una solicitud. |

Ejemplo de cuerpo para `POST /api/solicitudes`:

```json
{
  "animal_id": 1,
  "tipo_vivienda": "Casa",
  "tiene_patio": true,
  "con_quien_convive": "familiares tipo con niños de 3-4 años",
  "tuvo_mascotas": true,
  "tiene_mascotas": false,
  "experiencia": "He cuidado perros anteriormente",
  "motivo": "Quiero un animal de acompañamiento para mis hijos",
  "acepta_compromiso": true,
  "telefono": "+56912345678",
  "ciudad": "Valparaíso"
}
```

Se puede usar `?mias=true` en `GET /api/solicitudes` para consultar las solicitudes enviadas por el usuario autenticado en el caso de querer revisar las consultas de este usuario en especifico.

### Contenidos educativos

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/contenidos-educativos` | Público | Lista contenidos; permite filtrar por categoría. |
| GET | `/api/contenidos-educativos/:id` | Público | Obtiene un contenido por su ID. |
| POST | `/api/contenidos-educativos` | ADMIN | Crea un contenido. |
| PATCH | `/api/contenidos-educativos/:id` | ADMIN | Actualiza un contenido. |
| DELETE | `/api/contenidos-educativos/:id` | ADMIN | Elimina un contenido. |

Ejemplo de cuerpo para crear o actualizar contenido:

```json
{
  "titulo": "Cuidados básicos",
  "categoria": "Tenencia responsable",
  "contenido": "Proporciona agua limpia, alimentación adecuada y controles veterinarios."
}
```

### Rutas relacionadas con autenticación y usuarios

Estas rutas apoyan el funcionamiento de la API y la gestión de roles, son rutas que no pertenecen a una función de la página pero son necesarias para el trabajo de administradores o de uso logico publico como son los "login":

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/api/auth/registro` | Público | Registra una cuenta con rol ADOPTANTE. |
| POST | `/api/auth/login` | Público | Inicia sesión y entrega un token JWT. |
| POST | `/api/auth/renovar` | Token requerido | Renueva la sesión y devuelve el rol vigente. |
| GET | `/api/usuarios` | ADMIN | Lista usuarios; acepta el filtro opcional `?q=texto`. |
| PATCH | `/api/usuarios/:id/rol` | ADMIN | Cambia el rol de otro usuario. |

### Códigos HTTP

Todos estos codigos son utilizados y enviados por la página al momento de un error, cada uno separado por su razón especifica

- `200`: consulta o modificación realizada correctamente.
- `201`: recurso creado.
- `400`: datos inválidos.
- `401`: falta un token válido o la sesión expiró.
- `403`: el usuario no tiene el rol o permiso necesario.
- `404`: recurso no encontrado.
- `409`: conflicto con el estado actual de los datos.
- `413`: archivo demasiado grande.
- `500`: error inesperado del servidor.

# Consumo de la API REST desde el frontend (EP 2.4)
En esta fase se integró la interfaz gráfica interactiva con los servicios del servidor para operar con los datos persistentes. Esto se puede evidenciar en los siguientes puntos:
- **Conexión Frontend-Backend**: Se estableció la comunicación asíncrona desde la aplicación desarrollada en Ionic con React hacia los endpoints del servidor Node.js.
- **Peticiones HTTP y Manejo de Errores**: Se configuró el procesamiento de las solicitudes a la API utilizando interceptores, implementando un manejo adecuado de las respuestas y la captura de excepciones.
- **Gestión de Sesiones (JWT)**: Se implementó la administración del Json Web Token (JWT) en el cliente, asegurando su almacenamiento y envío en las peticiones para autorizar el acceso a recursos protegidos.
- **Envío de Datos Complejos (Multipart/FormData)**: Se implementó el empaquetado de datos a través de FormData desde el formulario tipo wizard en React, permitiendo enviar texto y archivos multimedia (imágenes) de forma simultánea hacia el endpoint de publicación.
- **Gestión de Flujos Basada en Roles**: El consumo de la API se vinculó a la protección de rutas del frontend. La interfaz ahora restringe o habilita el acceso a los formularios de creación evaluando el rol del usuario (ej. RESCATISTA) contenido en el payload del JWT

## ¿Cómo ejecutar este proyecto?
Sigue los siguientes pasos:
1) Abre la carpeta del Backend en tu editor de codigo (como Visual Studio Code o el que uses) y en la terminal ejecuta:
   ```
   npm install
   npm install multer
   npm start
   ```
2) Sin cerrar la carpeta del backend, ahora abre la carpeta del frontend en tu editor de codigo y en la terminal ejecuta:
   ```
   npm install
   npm run dev
   ```
_En resumen, debes abrir dos veces el editor de codigo (una para el backend y otra para el frontend) para que la página pueda funcionar y para que el backend interactúe con el frontend y viceversa._

3) Configurar el archivo .env; este paso ya está documentado.
4) Crear la base de datos en postgres ejecutando el script schema.sql.

Si seguiste los pasos correctamente, ya podrás navegar por la página.
