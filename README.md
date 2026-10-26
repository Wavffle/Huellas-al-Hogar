<p align="center">
  <img src="assets/logo-claro.png" alt="Logo de Huellas al Hogar" width="220">
</p>

*Entrega Parcial 2 · Ingeniería Web y Móvil*

Huellas al Hogar conecta a rescatistas que buscan un hogar para sus animales con personas dispuestas a adoptar. Reúne en un solo lugar la publicación de animales, el proceso de solicitud de adopción y contenido educativo sobre tenencia responsable y consecuencias del abandono.

Esta entrega (EP2) integra la aplicación con un backend propio: una API REST en Node.js y Express, una base de datos relacional en PostgreSQL, autenticación con JWT, tres roles diferenciados (administrador, rescatista y adoptante), medidas de seguridad y una colección de pruebas en Postman. La rama `EP2-Documentación` reúne la documentación de esta entrega: alcance, trazabilidad con la EP1, arquitectura, instrucciones de ejecución, documentación de la API, seguridad, pruebas, modelo relacional y matriz de cumplimiento.

### Organización del repositorio

| Rama | Contenido |
|---|---|
| [`EP1-Documentación`](https://github.com/Wavffle/Huellas-al-Hogar/tree/EP1-Documentaci%C3%B3n) | Documentación de la Entrega Parcial 1: problema, usuarios, requerimientos y arquitectura de navegación. |
| [`EP2-Documentación`](https://github.com/Wavffle/Huellas-al-Hogar/tree/EP2-Documentaci%C3%B3n) | Este documento: documentación de la Entrega Parcial 2. |
| [`frontend`](https://github.com/Wavffle/Huellas-al-Hogar/tree/frontend) | Aplicación cliente en Ionic + React + TypeScript. |
| [`backend`](https://github.com/Wavffle/Huellas-al-Hogar/tree/backend) | API REST en Express, esquema de la base de datos, colección de Postman y evidencias de prueba. |

> Para ejecutar el proyecto se necesitan las ramas `frontend` y `backend`, cada una en su propia carpeta. Las instrucciones están en el [apartado 5](#5-preparación-y-ejecución-local).

## Presentado por

- Alonso Troncoso
- Ricardo Vergara
- Claudio Vergara
- Benjamin Brito
## Índice

1. [Descripción y alcance](#1-descripción-y-alcance)
2. [Equipo, repositorio y trazabilidad](#2-equipo-repositorio-y-trazabilidad)
3. [Tecnologías](#3-tecnologías)
4. [Arquitectura y carpetas reales](#4-arquitectura-y-carpetas-reales)
5. [Preparación y ejecución local](#5-preparación-y-ejecución-local)
    - [5.1 Base de datos](#51-base-de-datos)
    - [5.2 Iniciar backend](#52-iniciar-backend)
    - [5.3 Iniciar frontend](#53-iniciar-frontend)
    - [5.4 Problemas frecuentes](#54-problemas-frecuentes)
6. [Documentación de la API](#6-documentación-de-la-api)
    - [6.1 POST /auth/registro](#61-post-authregistro)
    - [6.2 POST /auth/login](#62-post-authlogin)
    - [6.3 POST /solicitudes](#63-post-solicitudes)
    - [6.4 Formato de respuestas y códigos HTTP](#64-formato-de-respuestas-y-códigos-http)
7. [Seguridad y JWT](#7-seguridad-y-jwt)
8. [Integración frontend–backend](#8-integración-frontendbackend)
9. [Pruebas funcionales y evidencia EP2](#9-pruebas-funcionales-y-evidencia-ep2)
10. [Modelo relacional](#10-modelo-relacional)
11. [Matriz de cumplimiento EP2](#11-matriz-de-cumplimiento-ep2)
12. [Referencias](#12-referencias)

Proyecto Full Stack: Ionic + React + Node.js/Express. Este proyecto incluye un frontend en Ionic con React y un backend en Node.js con Express. Ambos se comunican vía API REST.

**Asignatura:** Ingeniería Web y Móvil
**Entrega:** EP2 — Integración frontend, backend y autenticación
**Ramas del repositorio:** `frontend` (interfaz), `backend` (servidor y base de datos) y `EP2-Documentación` (este documento).

> Los estados indicados en este documento corresponden a lo implementado y probado en el proyecto. Las pruebas se ejecutaron con Postman sobre un entorno local; ver las evidencias en el apartado 9.

## 1. Descripción y alcance

Huellas al Hogar es una plataforma web y móvil orientada a fomentar la adopción y la tenencia responsable de animales. Permite publicar animales en adopción, solicitar su adopción, gestionar las solicitudes recibidas y consultar contenido educativo sobre tenencia responsable y consecuencias del abandono. El sistema distingue tres roles: administrador, rescatista y adoptante.

### Funcionalidades implementadas

| Función | Ubicación | Estado |
|---|---|---|
| Registro de usuarios (rol ADOPTANTE por defecto) | `POST /api/auth/registro` | Implementado y probado |
| Inicio de sesión y emisión de JWT | `POST /api/auth/login` | Implementado y probado |
| Renovación de sesión con rol vigente | `POST /api/auth/renovar` | Implementado y probado |
| Catálogo público de animales con filtros | `GET /api/animales` | Implementado y probado |
| Publicar, editar y eliminar animales (con fotos) | `/api/animales` | Implementado y probado |
| Cambio de estado del animal (en adopción / en proceso / adoptado) | `PATCH /api/animales/:id` | Implementado y probado |
| Solicitud de adopción | `POST /api/solicitudes` | Implementado y probado |
| Revisión de solicitudes (aprobar / rechazar) | `PATCH /api/solicitudes/:id` | Implementado y probado |
| Historial de solicitudes del adoptante | `GET /api/solicitudes?mias=true` | Implementado y probado |
| Gestión de usuarios y asignación de roles | `/api/usuarios` | Implementado y probado |
| Gestión de contenido educativo | `/api/contenidos-educativos` | Implementado y probado |
| Rutas protegidas y diferenciación por rol en el frontend | `ProtectedRoute` | Implementado |
| Hash de contraseñas con bcrypt (costo 12) | `auth.controller.js` | Implementado |
| Pruebas Postman con evidencia | `docs/api` y `docs/evidencias` | Incluidas (68 peticiones) |

### Limitaciones conocidas

- El rol de rescatista lo asigna un administrador. La solicitud para obtenerlo se envía hoy por correo (`mailto`), sin un flujo dentro de la plataforma.
- No existe recuperación de contraseña.
- Las actualizaciones usan `PATCH` (actualización parcial); no se implementó `PUT`.
- El tráfico es HTTP porque el entorno es local; HTTPS corresponde al despliegue.
- Un cambio de rol se refleja en el token de la persona cuando este se renueva (al abrir la aplicación) o vence.

## 2. Equipo, repositorio y trazabilidad

- **Nombre del equipo:** [Huellas al Hogar]
- **Repositorio público:** [https://github.com/Wavffle/Huellas-al-Hogar]
- **Rama frontend:** [https://github.com/Wavffle/Huellas-al-Hogar/tree/frontend]
- **Rama backend:** [https://github.com/Wavffle/Huellas-al-Hogar/tree/backend]
- **Rama de documentación:** [https://github.com/Wavffle/Huellas-al-Hogar/tree/EP2-Documentaci%C3%B3n]
- **Figma:** [https://www.figma.com/design/9Jc4zhePHD6VnFI5WZZ94f/Huellas-al-Hogar?node-id=0-1&t=rUfy3ieeejAYiUIo-1]

| Integrante | Responsabilidad | Evidencia de colaboración |
|---|---|---|
| Alonso Troncoso | [Registro, inicio de sesión y renovación de sesión con JWT; hash de contraseñas con bcrypt (costo 12); middleware de verificación de token y de roles; límite de intentos en login y registro.] | [[Commits en `frontend`](https://github.com/Wavffle/Huellas-al-Hogar/commits/frontend?author=AlonsoTroncoso) · [Commits en `backend`](https://github.com/Wavffle/Huellas-al-Hogar/commits/backend?author=AlonsoTroncoso) · [`a861a94`](https://github.com/Wavffle/Huellas-al-Hogar/commit/a861a94), [`55b038d`](https://github.com/Wavffle/Huellas-al-Hogar/commit/55b038d)] |
| Ricardo Vergara | [Modelo relacional (MER, esquema SQL, datos de prueba y migraciones); API de contenido educativo; colección de Postman de 68 peticiones, API.md y evidencias.] | [[Commits en `frontend`](https://github.com/Wavffle/Huellas-al-Hogar/commits/frontend?author=sorintarin) · [Commits en `backend`](https://github.com/Wavffle/Huellas-al-Hogar/commits/backend?author=sorintarin) · [`a861a94`](https://github.com/Wavffle/Huellas-al-Hogar/commit/a861a94), [`55b038d`](https://github.com/Wavffle/Huellas-al-Hogar/commit/55b038d)] |
| Claudio Vergara | [Documentación fuera del proyecto y organziación de la estructura y rutas, recopilación de evidencia y pruebas.] | [[Commits en `frontend`](https://github.com/Wavffle/Huellas-al-Hogar/commits/frontend?author=0Yayo0) · [Commits en `backend`](https://github.com/Wavffle/Huellas-al-Hogar/commits/backend?author=0Yayo0) · [`a861a94`](https://github.com/Wavffle/Huellas-al-Hogar/commit/a861a94), [`55b038d`](https://github.com/Wavffle/Huellas-al-Hogar/commit/55b038d)] |
| Benjamin Brito | [Diseño UI/UX en Figma e implementación del frontend: navegación y rutas protegidas por rol, formularios con validación (solicitud de adopción y publicación en 5 pasos con fotos), catálogo con filtros, paneles de rescatista y administración. Aportes puntuales al backend: subida de fotos y datos del listado de animales.] | [[Commits en `frontend`](https://github.com/Wavffle/Huellas-al-Hogar/commits/frontend?author=Wavffle) · [Commits en `backend`](https://github.com/Wavffle/Huellas-al-Hogar/commits/backend?author=Wavffle) · [`a861a94`](https://github.com/Wavffle/Huellas-al-Hogar/commit/a861a94), [`55b038d`](https://github.com/Wavffle/Huellas-al-Hogar/commit/55b038d)] |

### Relación con EP1

| Requerimiento EP1 | Implementación en EP2 |
|---|---|
| RF-01 Publicar animal | Formulario de 5 pasos en `/publicar`; `POST /api/animales` con fotos |
| RF-02 Explorar animales | `/adopciones` con filtros y búsqueda; `GET /api/animales` |
| RF-03 Solicitud de adopción | `/adopciones/:animalId/solicitar`; `POST /api/solicitudes` |
| RF-04 Revisar solicitudes | Pestaña "Solicitudes recibidas" en `/panel`; `GET /api/solicitudes` |
| RF-05 Cambiar estado | Selector de estado en `/panel`; `PATCH /api/animales/:id` |
| RF-06 Gestión de contenido educativo | Pestaña "Artículos" en `/admin`; `/api/contenidos-educativos` |
| RF-07 Gestión y moderación | `/admin`: usuarios, roles y eliminación de publicaciones; `/api/usuarios` |
| RF-08 Historial de solicitudes | `/mis-solicitudes`; `GET /api/solicitudes?mias=true` |
| RF-09 Gestión de publicaciones | Editar y eliminar en `/panel`; `PATCH` y `DELETE /api/animales/:id` |

## 3. Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | Ionic 8 + React 18 + TypeScript + Vite, React Router v5, CSS plano por componente |
| Backend | Node.js + Express 5 |
| Base de datos | PostgreSQL 14+, controlador `pg` (sin ORM) |
| Autenticación | `jsonwebtoken` y `bcrypt` |
| Subida de archivos | `multer` |
| Comunicación | Axios con interceptores, HTTP y JSON |
| Configuración CORS | Paquete `cors` (orígenes configurables con `CORS_ORIGIN`) |
| Pruebas | Postman |

## 4. Arquitectura y carpetas reales

```
Huellas-al-Hogar/
├── (rama backend)
│   ├── .env.example
│   ├── package.json
│   ├── database/
│   │   ├── schema.sql
│   │   ├── seed.sql
│   │   ├── seed.js
│   │   └── migracion-001-contacto-solicitud.sql
│   ├── docs/
│   │   ├── base-de-datos/
│   │   ├── api/
│   │   └── evidencias/
│   ├── uploads/
│   └── src/
│       ├── server.js
│       ├── config/database.js
│       ├── controllers/   (auth, animales, solicitudes, educativos, usuarios)
│       ├── middleware/    (auth, upload, limitarIntentos)
│       └── routes/
└── (rama frontend)
    ├── package.json
    └── src/
        ├── main.tsx / App.tsx
        ├── routes/        (AppRoutes, ProtectedRoute, PublishGate)
        ├── contexts/      (AuthContext)
        ├── services/      (apiClient, authService, animalService, solicitudService, usuarioService, contenidoService)
        ├── pages/
        ├── components/
        └── theme/
```

```
Ionic + React (Vite, :5173)
      │  Axios / JSON / Bearer JWT (interceptores)
      ▼
Express :3000 → /api → routes → middleware (verificarToken, permitirRoles) → controllers → PostgreSQL
                                         │
                                         └── multer → /uploads (fotos de animales)
```

## 5. Preparación y ejecución local

### Requisitos

- Node.js v18 o superior y npm.
- PostgreSQL v14 o superior en ejecución.
- Copia local de las ramas `backend` y `frontend` (cada una en su propia carpeta).

### 5.1 Base de datos

```bash
CREATE DATABASE "huellas-al-hogar";
psql -U postgres -d huellas-al-hogar -f database/schema.sql
psql -U postgres -d huellas-al-hogar -f database/seed.sql
```

`schema.sql` crea los tipos ENUM, las tablas y las relaciones. `seed.sql` crea tres cuentas de prueba, y es seguro ejecutarlo más de una vez.

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | `admin@huellas.test` | `Admin1234` |
| Rescatista | `rescatista@huellas.test` | `Rescata1234` |
| Adoptante | `adoptante@huellas.test` | `Adopta1234` |

Son cuentas de prueba solo para evaluación local. Quien ya tenía la base creada debe ejecutar además `database/migracion-001-contacto-solicitud.sql`.

### 5.2 Iniciar backend

```bash
cd backend
copy .env.example .env      # Windows (en Mac/Linux: cp .env.example .env)
npm install
npm start
```

Completar en el `.env` al menos `PGPASSWORD` (y `PGDATABASE` si usó otro nombre). `JWT_SECRET` debe tener 32 caracteres o más. La API queda disponible en `http://localhost:3000`; se puede comprobar con `GET /api/health`.

| Variable | Uso |
|---|---|
| `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD` | Conexión a PostgreSQL |
| `JWT_SECRET` | Clave de firma del token (mínimo 32 caracteres) |
| `JWT_EXPIRES_IN` | Duración del token (8h por defecto) |
| `CORS_ORIGIN` | Opcional. Orígenes permitidos separados por coma |

### 5.3 Iniciar frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

La aplicación se abre en `http://localhost:5173` y se conecta a `http://localhost:3000`. La URL del backend puede cambiarse con la variable `VITE_API_URL`.

### 5.4 Problemas frecuentes

| Síntoma | Qué revisar |
|---|---|
| Error de conexión a PostgreSQL | Servicio activo, usuario, contraseña y nombre de la base en `.env` |
| `ECONNREFUSED` en el frontend | Backend activo en el puerto 3000 |
| 500 al iniciar sesión o registrarse | `JWT_SECRET` ausente o con menos de 32 caracteres |
| 401 "Se requiere un token de acceso" | Falta el encabezado `Authorization: Bearer <token>` |
| 429 en login o registro | Límite de 20 intentos cada 15 minutos por IP; reiniciar el backend |
| Error al subir fotos | Existencia de la carpeta `uploads/`; formato JPG, PNG o WebP de hasta 5 MB |
| Errores CORS | Revisar `CORS_ORIGIN` o dejarlo sin definir en desarrollo |

## 6. Documentación de la API

URL base: `http://localhost:3000/api`. Tipo de contenido: `application/json` (`multipart/form-data` para animales con fotos). La documentación completa de cada endpoint (cuerpo, roles y respuestas) está en [`docs/api/API.md`]([URL rama backend]/docs/api/API.md).

| Método | Ruta | Acceso |
|---|---|---|
| POST | `/auth/registro` | Público |
| POST | `/auth/login` | Público |
| POST | `/auth/renovar` | Token |
| GET | `/animales` | Público |
| GET | `/animales/:id` | Público (token opcional) |
| GET | `/animales/mios` | RESCATISTA, ADMIN |
| POST | `/animales` | RESCATISTA, ADMIN |
| PATCH | `/animales/:id` | Dueño RESCATISTA, ADMIN |
| DELETE | `/animales/:id` | Dueño RESCATISTA, ADMIN |
| GET | `/solicitudes` | Token |
| GET | `/solicitudes/:id` | Autor, dueño del animal o ADMIN |
| POST | `/solicitudes` | ADOPTANTE, RESCATISTA |
| PATCH | `/solicitudes/:id` | Dueño RESCATISTA, ADMIN |
| DELETE | `/solicitudes/:id` | ADMIN |
| GET | `/contenidos-educativos` y `/:id` | Público |
| POST, PATCH, DELETE | `/contenidos-educativos` | ADMIN |
| GET | `/usuarios` | ADMIN |
| PATCH | `/usuarios/:id/rol` | ADMIN |

### 6.1 POST /auth/registro

```json
{ "nombre": "Usuario Demo", "correo": "demo@example.com", "password": "Clave12345" }
```

Respuesta 201: `{ "success": true, "message": "Cuenta creada correctamente", "data": { "token": "<JWT>", "usuario": { "id": 4, "nombre": "Usuario Demo", "correo": "demo@example.com", "rol": "ADOPTANTE" } } }`. El rol lo asigna el servidor y la contraseña nunca se devuelve. Errores: 400 (datos inválidos), 409 (correo repetido), 429.

### 6.2 POST /auth/login

```json
{ "correo": "admin@huellas.test", "password": "Admin1234", "recordar": false }
```

Respuesta 200 con `token` y `usuario`. Errores: 400 (faltan datos), 401 (correo o contraseña incorrectos; el mensaje es el mismo en ambos casos), 429.

### 6.3 POST /solicitudes

```json
{
  "animal_id": 1, "tipo_vivienda": "Casa", "tiene_patio": true,
  "con_quien_convive": "Familia", "tuvo_mascotas": true, "tiene_mascotas": false,
  "experiencia": "He tenido perros", "motivo": "Quiero un compañero",
  "acepta_compromiso": true, "telefono": "+56912345678", "ciudad": "Valparaíso"
}
```

Respuesta 201 con la solicitud en estado `PENDIENTE`. Errores: 400, 401, 403 (animal propio), 404, 409 (animal no disponible o solicitud pendiente repetida).

### 6.4 Formato de respuestas y códigos HTTP

Éxito: `{ "success": true, "message": "...", "data": {} }`. Error: `{ "success": false, "error": { "message": "...", "fields": [] } }`.

| Código | Uso |
|---|---|
| 200 / 201 | Operación correcta / recurso creado |
| 400 | Datos inválidos |
| 401 | Falta un token válido o la sesión expiró |
| 403 | El rol o la autoría no permiten la operación |
| 404 | Recurso no encontrado |
| 409 | Conflicto con el estado de los datos |
| 413 | Archivo demasiado grande |
| 429 | Demasiados intentos |
| 500 | Error inesperado del servidor |

## 7. Seguridad y JWT

| Control EP2 | Implementación |
|---|---|
| JWT con expiración | Sí. 8 horas por defecto (`JWT_EXPIRES_IN`) o 30 días con "Mantener sesión iniciada". El token firma solo el id y el rol |
| Rutas protegidas en backend | `verificarToken` en toda ruta que modifica datos o entrega información privada |
| Roles diferenciados | ADMIN, RESCATISTA y ADOPTANTE con `permitirRoles`; un rescatista solo modifica sus propios animales |
| bcrypt | `bcrypt.hash` con costo 12 al registrar y `bcrypt.compare` al iniciar sesión |
| Secretos en variables de entorno | `.env` fuera de git; solo se versiona `.env.example`. El servidor rechaza un `JWT_SECRET` de menos de 32 caracteres |
| Validación de entradas | Tipos, largos, valores permitidos y campos desconocidos validados en cada endpoint; responde 400 con la lista de campos inválidos |
| Prevención de SQL injection | Todas las consultas son parametrizadas (`$1`, `$2`, …); ningún dato del usuario se concatena en el SQL |
| Minimización de datos | `password_hash` nunca se devuelve; las respuestas de error no revelan si el correo existe |
| Límite de intentos | 20 intentos cada 15 minutos por IP en login y registro (429) |
| Subida de archivos | Solo JPG, PNG y WebP de hasta 5 MB; nombres generados por el servidor; los archivos se eliminan si la operación falla |
| Protección de rutas frontend | `ProtectedRoute` con validación de rol; conserva la ruta de origen tras iniciar sesión |
| Manejo de errores | Manejador global con mensajes seguros y códigos HTTP coherentes |

## 8. Integración frontend–backend

- **Cliente HTTP:** `src/services/apiClient.ts` crea la instancia de Axios con URL base configurable, tiempo máximo de espera (15 s), un interceptor de petición que agrega `Authorization: Bearer <token>` y un interceptor de respuesta que cierra la sesión ante un 401 (excepto en login y registro).
- **Manejo de errores:** la función `apiError` convierte cualquier error de Axios en un código y un mensaje para el usuario; las pantallas muestran el mensaje del servidor (por ejemplo, el 409 de solicitud duplicada).
- **Sesión:** `AuthContext` guarda el token y el usuario, valida la expiración, renueva el token al abrir la aplicación y antes de enviar el formulario de publicar, y sincroniza la sesión entre pestañas.
- **Rutas protegidas:** `ProtectedRoute` exige sesión y, si corresponde, un rol (`/panel`, `/admin`, `/mis-solicitudes`, `/adopciones/:id/solicitar`). `PublishGate` muestra el formulario solo a rescatistas y administradores.
- **Servicios por recurso:** `authService`, `animalService`, `solicitudService`, `usuarioService` y `contenidoService`.
- **Envío de archivos:** el formulario de publicar y editar usa `FormData` con las fotos.
- **Datos reales:** el catálogo, el detalle, las solicitudes, los paneles y los artículos educativos se cargan desde la API.

## 9. Pruebas funcionales y evidencia EP2

La colección de Postman está en [`docs/api/`]([URL rama backend]/docs/api) y contiene 68 peticiones en 7 carpetas. Cada petición verifica el código HTTP, que la respuesta sea JSON y la estructura de éxito o error. Instrucciones y capturas: [`docs/evidencias/`]([URL rama backend]/docs/evidencias).

| ID | Petición / escenario | HTTP | Evidencia |
|---|---|---|---|
| P01 | Registrar usuario válido | 201 | Colección, carpeta 1 |
| P02 | Registrar correo repetido | 409 | Colección, carpeta 1 |
| P03 | Iniciar sesión válida (admin, rescatista, adoptante) | 200 | `02-login-admin.png` |
| P04 | Login sin credenciales | 400 | Colección, carpeta 1 |
| P05 | Login con contraseña incorrecta | 401 | Colección, carpeta 1 |
| P06 | Recurso protegido sin token | 401 | `03-401-sin-token.png` |
| P07 | Recurso protegido con token inválido | 401 | Colección, carpeta 6 |
| P08 | Renovar sesión con token válido | 200 | Colección, carpeta 1 |
| P09 | CRUD de animales (GET, POST, PATCH, DELETE) | 200 / 201 | Colección, carpetas 2 y 7 |
| P10 | Rol no autorizado (adoptante crea animal) | 403 | `04-403-rol.png` |
| P11 | Solicitud de adopción repetida | 409 | `05-409-duplicada.png` |
| P12 | Intento de inyección SQL en el login | 401 | `06-sql-injection.png` |
| P13 | Aprobar solicitud; el animal pasa a "en proceso" | 200 | `07-aprobar-solicitud.png` |
| P14 | Rescatista solicita su propio animal | 403 | Colección, carpeta 3 |

Resultado de la ejecución completa de la colección: [Completar con el total de pruebas aprobadas, por ejemplo "68 peticiones, 0 fallidas"].

![Resultado del Runner](./evidencias/01-runner-resultado.png)

**Video del flujo completo de la plataforma:** [URL de Google Drive]

## 10. Modelo relacional

Archivos del repositorio (rama `backend`): `database/schema.sql` (estructura completa) y `database/seed.sql` (cuentas de prueba).

![Modelo Entidad-Relación](./img/merHuellasAlHogar.png)

![Esquema relacional](./img/erHAH.png)

| Tabla | Clave primaria | Claves foráneas y restricciones principales |
|---|---|---|
| `usuarios` | `id` | `correo` único y obligatorio; `rol` es un ENUM (`ADMIN`, `RESCATISTA`, `ADOPTANTE`) |
| `animales` | `id` | `usuario_id` → `usuarios(id)` con `ON DELETE CASCADE`; `CHECK` en sexo, tamaño, vacunas y esterilización; ENUM para estado y tipo de rescate |
| `foto_animales` | `id` | `animal_id` → `animales(id)` con `ON DELETE CASCADE`; `CHECK (orden BETWEEN 1 AND 5)` |
| `solicitudes_adopcion` | `id` | `usuario_id` → `usuarios(id)` y `animal_id` → `animales(id)`, ambas con `ON DELETE CASCADE`; ENUM de estado; `telefono` y `ciudad` de contacto |
| `contenidos_educativos` | `id` | `usuario_id` → `usuarios(id)` con `ON DELETE CASCADE` |

Relaciones: un usuario publica muchos animales; un animal tiene hasta cinco fotos; un adoptante envía muchas solicitudes y cada animal puede recibir muchas; un administrador publica los contenidos educativos.

## 11. Matriz de cumplimiento EP2

| Criterio | Evidencia | Estado |
|---|---|---|
| EP 2.1 Servidor (10 pts) | Servidor Express modular, comprobación de salud (`/api/health`), instrucciones de instalación | Implementado |
| EP 2.2 Base relacional (15 pts) | `schema.sql` reproducible, claves foráneas, restricciones, MER y esquema relacional | Implementado; diagramas por actualizar con `telefono` y `ciudad` [revisar] |
| EP 2.3 API REST (20 pts) | GET, POST, PATCH y DELETE con JSON estructurado y códigos HTTP | Implementado (se usa PATCH en lugar de PUT) |
| EP 2.4 JWT y roles (15 pts) | Registro, login, expiración, renovación, rutas protegidas y tres roles | Implementado |
| EP 2.5 Seguridad (15 pts) | bcrypt, validación, secretos en `.env`, consultas parametrizadas, límite de intentos | Implementado |
| EP 2.6 Ionic React + backend (10 pts) | Consumo real con Axios, interceptores, JWT y manejo de errores | Implementado |
| EP 2.7 Pruebas (10 pts) | Colección Postman de 68 peticiones, `API.md` y capturas | Implementado |
| Documentación (5 pts) | Este documento, README de cada rama, ramas e integrantes | Implementado |

## 12. Referencias

- [Ionic Framework](https://ionicframework.com/docs/react)
- [Express](https://expressjs.com/)
- [PostgreSQL](https://www.postgresql.org/docs/)
- [JSON Web Tokens](https://jwt.io/)
- [Postman](https://www.postman.com/)
