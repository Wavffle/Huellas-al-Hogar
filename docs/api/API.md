# Documentación de la API — Huellas al Hogar

URL base: `http://localhost:3000/api`

Las rutas protegidas requieren el encabezado `Authorization: Bearer <token>`. El token se obtiene en `POST /auth/login` o `POST /auth/registro`.
Para actualizar datos se usa `PATCH` (actualización parcial: solo se envían los campos que cambian).

## Formato de las respuestas

Éxito:
```json
{ "success": true, "message": "Operación realizada correctamente", "data": {} }
```
Error:
```json
{ "success": false, "error": { "message": "Descripción del error", "fields": ["campo1"] } }
```
`fields` aparece solo cuando hay campos inválidos.

## Códigos HTTP

| Código | Significado |
|---|---|
| 200 | Consulta o modificación correcta |
| 201 | Recurso creado |
| 400 | Datos inválidos |
| 401 | Falta un token válido o la sesión expiró |
| 403 | El rol o la autoría no permiten la operación |
| 404 | Recurso no encontrado |
| 409 | Conflicto con el estado actual de los datos |
| 413 | Archivo demasiado grande (máx. 5 MB por foto) |
| 429 | Demasiados intentos de login o registro |
| 500 | Error inesperado del servidor |

## Autenticación

| Método | Ruta | Acceso | Cuerpo | Respuestas |
|---|---|---|---|---|
| POST | `/auth/registro` | Público | `{ nombre, correo, password }` | 201 `{ token, usuario }` · 400 · 409 correo repetido · 429 |
| POST | `/auth/login` | Público | `{ correo, password, recordar? }` | 200 `{ token, usuario }` · 400 · 401 · 429 |
| POST | `/auth/renovar` | Token | — | 200 `{ token, usuario }` con el rol vigente · 401 |

- La contraseña debe tener al menos 8 caracteres y un máximo de 72 bytes. Se guarda con bcrypt (costo 12).
- El rol de una cuenta nueva siempre es `ADOPTANTE`.
- `recordar: true` entrega un token de 30 días; sin él dura lo definido en `JWT_EXPIRES_IN` (8h por defecto).

Ejemplo de respuesta de login:
```json
{
  "success": true,
  "message": "Inicio de sesión correcto",
  "data": {
    "token": "eyJhbGciOi...",
    "usuario": { "id": 1, "nombre": "Admin Prueba", "correo": "admin@huellas.test", "rol": "ADMIN" }
  }
}
```

## Animales

| Método | Ruta | Acceso | Respuestas |
|---|---|---|---|
| GET | `/animales` | Público | 200 lista de animales en adopción y en proceso (los adoptados no aparecen) |
| GET | `/animales/mios` | RESCATISTA, ADMIN | 200 publicaciones propias con `solicitudes_pendientes` (ADMIN puede usar `?todos=true`) · 401 · 403 |
| GET | `/animales/:id` | Público (token opcional) | 200 con `fotos` · 400 · 404 (un animal adoptado solo lo ve su dueño o un ADMIN) |
| POST | `/animales` | RESCATISTA, ADMIN | 201 · 400 · 401 · 403 · 413 |
| PATCH | `/animales/:id` | Dueño RESCATISTA, ADMIN | 200 · 400 · 401 · 403 · 404 · 413 |
| DELETE | `/animales/:id` | Dueño RESCATISTA, ADMIN | 200 (borra también las fotos del disco) · 401 · 403 · 404 |

**POST** usa `multipart/form-data`:

| Campo | Obligatorio | Valores |
|---|---|---|
| `nombre` | Sí | texto, máx. 100 |
| `especie` | Sí | texto, máx. 50 |
| `sexo` | No | `MACHO`, `HEMBRA` |
| `tamanho` | No | `PEQUEÑO`, `MEDIANO`, `GRANDE` |
| `edad`, `edad_meses` | No | enteros ≥ 0 |
| `ciudad`, `descripcion`, `personalidad`, `cuidado_especial`, `razon_adopcion`, `vacunas_detalles` | No | texto |
| `rescate` | No | `RESCATE`, `ENTREGADO_FAMILIA`, `REFUGIO`, `CAMADA` |
| `vacunas_estado` | No | `AL_DIA`, `FALTAN`, `NO_TIENE` |
| `esterilizado` | No | `SI`, `NO`, `NO_SABE` |
| `fecha_esterilizacion` | No | `AAAA-MM-DD` |
| `ideal_para`, `convive_con`, `etiquetas` | No | lista separada por comas |
| `fotos` | Sí | de 1 a 5 archivos JPG, PNG o WebP |

El estado inicial siempre es `EN_ADOPCION`; lo decide el servidor. El dueño se toma del token.

**PATCH** acepta JSON (por ejemplo `{ "estado": "EN_TRATAMIENTO" }`) o `multipart/form-data`. Estados válidos: `EN_ADOPCION`, `EN_TRATAMIENTO` (se muestra como "En proceso") y `ADOPTADO`. Para las fotos: `fotos_conservar` (ids separados por comas, en el orden deseado) y `fotos` (archivos nuevos). Deben quedar de 1 a 5.

## Solicitudes de adopción

| Método | Ruta | Acceso | Respuestas |
|---|---|---|---|
| GET | `/solicitudes` | Token | 200. ADOPTANTE: las propias · RESCATISTA: las recibidas · ADMIN: todas. `?mias=true` devuelve las enviadas por el usuario. Filtros: `animal_id`, `usuario_id`, `estado` |
| GET | `/solicitudes/:id` | Autor, dueño del animal o ADMIN | 200 · 400 · 401 · 404 |
| POST | `/solicitudes` | ADOPTANTE, RESCATISTA | 201 · 400 · 401 · 403 animal propio · 404 · 409 animal no disponible o solicitud pendiente repetida |
| PATCH | `/solicitudes/:id` | Dueño RESCATISTA, ADMIN | 200 · 400 · 401 · 403 · 404 · 409 |
| DELETE | `/solicitudes/:id` | ADMIN | 200 · 401 · 403 · 404 |

Cuerpo de `POST /solicitudes` (JSON):
```json
{
  "animal_id": 1,
  "tipo_vivienda": "Casa",
  "tiene_patio": true,
  "con_quien_convive": "Familia",
  "tuvo_mascotas": true,
  "tiene_mascotas": false,
  "experiencia": "He tenido perros",
  "motivo": "Quiero un compañero",
  "acepta_compromiso": true,
  "telefono": "+56912345678",
  "ciudad": "Valparaíso"
}
```
`tipo_vivienda` admite hasta 50 caracteres. `telefono` va con prefijo internacional (`+` y de 8 a 18 dígitos). `experiencia` es opcional.

Las respuestas de `GET` incluyen además `postulante_nombre`, `postulante_correo`, `animal_nombre`, `animal_estado` y `animal_imagen`.

**PATCH** recibe solo `{ "estado": "APROBADA" }` o `{ "estado": "RECHAZADA" }`, y únicamente desde `PENDIENTE`. Al aprobar, el animal pasa a `EN_TRATAMIENTO` ("En proceso") y las demás solicitudes pendientes de ese animal quedan `RECHAZADA`.

## Contenidos educativos

| Método | Ruta | Acceso | Respuestas |
|---|---|---|---|
| GET | `/contenidos-educativos` | Público | 200. Filtro opcional `?categoria=` |
| GET | `/contenidos-educativos/:id` | Público | 200 · 400 · 404 |
| POST | `/contenidos-educativos` | ADMIN | 201 · 400 · 401 · 403 |
| PATCH | `/contenidos-educativos/:id` | ADMIN | 200 · 400 · 401 · 403 · 404 |
| DELETE | `/contenidos-educativos/:id` | ADMIN | 200 · 401 · 403 · 404 |

Cuerpo: `{ "titulo": "...", "categoria": "Tenencia responsable", "contenido": "..." }`. El autor se toma del token.

## Usuarios (administración)

| Método | Ruta | Acceso | Respuestas |
|---|---|---|---|
| GET | `/usuarios` | ADMIN | 200 lista con número de publicaciones. Filtro opcional `?q=` por nombre o correo · 401 · 403 |
| PATCH | `/usuarios/:id/rol` | ADMIN | 200 · 400 rol inválido · 401 · 403 · 404 · 409 si intenta cambiar su propio rol |

Cuerpo: `{ "rol": "RESCATISTA" }`. Valores: `ADMIN`, `RESCATISTA`, `ADOPTANTE`.

## Estado del servidor

| Método | Ruta | Respuesta |
|---|---|---|
| GET | `/api/health` | 200 estado del servicio |
| GET | `/api/health/database` | 200 si PostgreSQL responde · 503 si no |
