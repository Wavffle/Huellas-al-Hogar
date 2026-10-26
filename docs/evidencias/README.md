# Evidencias de pruebas (EP 2.7)

Pruebas funcionales realizadas con Postman sobre la API. La colección está en [`../api/`](../api) y contiene 68 peticiones con pruebas automáticas que verifican el código HTTP y la estructura de cada respuesta.

## Resultado de la ejecución completa

![Resultado del Runner](./img/01-runner-resultado.png)

## Autenticación y roles

**Inicio de sesión del administrador (200)**

![Login admin](./img/02-login-administrador.png)

**Petición protegida sin token (401)**

![Sin token](./img/03-401-sin-token.png)

**Un adoptante intenta crear un animal (403)**

![Rol no permitido](./img/04-403-rol.png)

## Reglas del negocio

**Solicitud de adopción repetida (409)**

![Solicitud duplicada](./img/05-409-duplicada.png)

**Aprobar una solicitud deja al animal "En proceso"**

![Aprobar solicitud](./img/07-aprobar-solicitud.png)

## Seguridad

**Intento de inyección SQL en el login (401)**

![Inyección SQL](./img/06-sql-injection.png)

## Video del flujo completo

[Ver video en Google Drive](https://drive.google.com/file/d/1iTrnilpy7mvVo4KkJhElS0W45Rq_eQJG/view?usp=sharing)