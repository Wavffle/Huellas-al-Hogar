# Huellas-al-Hogar
Plataforma web y móvil orientada a fomentar la adopción y tenencia responsable de animales, entregando información preventiva sobre el abandono, el cuidado animal y las consecuencias de la proliferación de animales callejeros.

## Presentado por

- Alonso Troncoso
- Ricardo Vergara
- Claudio Vergara
- Benjamin Brito

## Índice

4. [Arquitectura de Navegación](#arquitectura-de-navegación)
    - [Rutas principales y secundarias](#1-rutas-principales-y-secundarias)
    - [Relaciones jerárquicas entre vistas](#2-relaciones-jerárquicas-entre-vistas)
    - [Flujo de interacción entre pantallas](#3-flujo-de-interacción-entre-pantallas)
    - [Diferenciación de acceso según roles](#diferenciación-de-acceso-según-roles)
    - [Flujos de Tareas](#flujos-de-tareas)
    - [Puntos críticos de interacción](#puntos-críticos-de-interacción)
    - [Coherencia de experiencia entre dispositivos](#coherencia-de-experiencia-entre-dispositivos)
    - [Justificación Técnica](#justificación-técnica)
    - [Tecnologías y herramientas utilizadas](#tecnologías-y-herramientas-utilizadas)

5. [Diseño UX/UI](#diseño-uxui)

---

## Arquitectura de Navegación

### 1. Rutas principales y secundarias

El sistema utiliza una estructura de árbol, partiendo desde un punto de inicio hacia las diferentes ramas del contenido que ofrece la página web.

Se consideran las siguientes rutas principales:

- **Adopciones**
- **Tenencia responsable**
- **Consecuencias del abandono**
- **Publicar animal**
- **Perfil**

Dentro de estas rutas se encuentran vistas secundarias asociadas a las distintas funcionalidades de la plataforma.

### 2. Relaciones jerárquicas entre vistas

La organización de las vistas sigue la siguiente estructura jerárquica:

```text
Inicio (Pantalla Principal)
│
├── Adopciones (Ruta principal)
│   └── Lista de animales
│       └── Detalle del animal (Ruta secundaria / Hija)
│           └── Solicitud de adopción
│
├── Tenencia responsable (Ruta principal)
│   └── Artículo / contenido
│
├── Consecuencias del abandono (Ruta principal)
│
├── Publicar animal (Ruta principal)
│   └── Formulario de publicación
│
└── Perfil (Ruta principal)
    └── Mis solicitudes / publicaciones
```
---
### 3. Flujo de interacción entre pantallas

#### Navegación global

Se utilizará una **Barra de Navegación Superior (Topbar)** estática para acceder rápidamente a las ramas principales:

- Adopciones
- Tenencia
- Publicar
- Perfil

Esta barra agiliza la navegación dentro de la página web.

#### Navegación secundaria

Al ingresar al detalle de un animal o a un artículo, la vista cambiará utilizando el enrutador `react-router`.

Se mantendrá visible un sistema de *breadcrumbs*, por ejemplo:

`Inicio > Adopciones > Max`

También podrá utilizarse un botón claro de **"Volver al listado"** ubicado en la esquina superior izquierda, evitando que el usuario dependa del botón de retroceso del navegador.

---

## Diferenciación de acceso según roles

La plataforma considera diferentes niveles de acceso de acuerdo con el tipo de usuario.

### Usuario no registrado

Tiene acceso a:

- Lista de animales.
- Detalles de los animales.
- Tenencia responsable.
- Consecuencias del abandono.

Si desea adoptar un animal, deberá iniciar sesión.

---

### Adoptante

Tiene acceso a las mismas secciones disponibles para un usuario no registrado.

La diferencia es que, al encontrarse registrado en el sitio web, está habilitado para realizar el proceso de adopción.

---

### Rescatista

Utiliza la plataforma como herramienta para dar animales en adopción.

Solo tiene control sobre el contenido que él mismo crea.

Puede:

- publicar animales mediante un formulario para subir fotografías y datos del perro o gato rescatado;
- gestionar sus publicaciones;
- cambiar el estado de un animal a **"Adoptado"** o **"En proceso"**, evitando que continúe apareciendo en la lista principal;
- revisar las solicitudes de personas interesadas en adoptar los animales publicados.

---

### Administrador

Tiene control sobre los usuarios registrados en la plataforma.

Puede:

- visualizar usuarios registrados;
- asignar roles;
- otorgar el "check" oficial a una cuenta de Rescatista;
- banear usuarios que hagan mal uso del sitio;
- editar o eliminar publicaciones de rescatistas que incumplan las normas;
- gestionar contenido estático como **Tenencia responsable** y **Consecuencias del abandono**, creando, editando o eliminando artículos.

---

## Flujos de Tareas

### Task Flow 1: Proceso de adopción

1. El usuario navega en `Lista de animales`, aplicando opcionalmente filtros desde la barra lateral.
2. Hace clic en una tarjeta e ingresa al `Detalle del animal`.
3. Lee la información y presiona el botón `Adoptar`.
4. Si está registrado, pasa a `Solicitud de adopción`. En caso contrario, se despliega una ventana modal de Login.
5. Completa el formulario y lo envía.
6. El sistema muestra un mensaje de éxito y retorna al usuario a la lista de animales.

---

### Puntos críticos de interacción

Los formularios de `Publicar animal` y `Solicitud de adopción` corresponden a puntos críticos de interacción.

Si un usuario comete un error:

- el formulario no se enviará;
- los campos erróneos se resaltarán con bordes rojos;
- se mostrará un texto de ayuda (*helper text*) debajo del campo indicando qué debe corregirse.

---

### Coherencia de experiencia entre dispositivos

Al ser una aplicación web, se utilizarán patrones de diseño responsivos (*Responsive Web Design*).

En pantallas de escritorio, el Navbar mostrará todos los enlaces desplegados.

Si el usuario accede desde un dispositivo móvil, el Navbar colapsará automáticamente en un botón de **Menú Hamburguesa**, utilizando componentes adaptables de Ionic como `IonMenu` e `IonHeader`.

---

### Justificación Técnica

La arquitectura considera decisiones relacionadas con usabilidad, eficiencia de interacción y escalabilidad del frontend.

#### Usabilidad y claridad

La barra superior mantiene las opciones visibles durante la navegación web, reduciendo la carga cognitiva.

#### Eficiencia de interacción

El uso de modales para el Login durante el flujo de adopción evita que el usuario abandone la página del animal y pierda el contexto de la acción que estaba realizando.

#### Escalabilidad frontend

Separar las vistas en rutas independientes mediante `react-router` permitirá, a futuro, compartir enlaces directos a animales específicos.

---

### Tecnologías y herramientas utilizadas

- **Frontend:** Ionic Framework + React + TypeScript, enfocado en Web/PWA.
- **Navegación:** React Router (`react-router-dom`).
- **Diseño UI:** Figma.
- **Control de versiones:** GitHub.

---

# Diseño UX/UI

El diseño de la interfaz de **Huellas al Hogar** fue desarrollado en Figma, considerando la estructura de navegación definida previamente, la adaptación entre versiones web y móvil y la coherencia visual del proyecto.

El archivo de Figma se encuentra organizado en distintas páginas para facilitar la revisión y mantener separados los diferentes niveles del proceso de diseño:

- **Página 1 (Mockups):** contiene las interfaces de alta fidelidad de las principales pantallas de la aplicación, utilizando la identidad visual definida para el proyecto.
- **Página 2 (Wireframes):** contiene los bocetos de baja fidelidad utilizados para definir la distribución, jerarquía de información y estructura de las principales interfaces antes de desarrollar los mockups.
- **Página 3 (Guía de estilo):** reúne los principales lineamientos visuales del proyecto, incluyendo paleta de colores, tipografías, logotipo y referencias utilizadas durante el proceso de diseño.

### Prototipo y diseño en Figma

El archivo completo de diseño puede consultarse en el siguiente enlace:

[Ver diseño y prototipo en Figma](https://www.figma.com/design/9Jc4zhePHD6VnFI5WZZ94f/Huellas-al-Hogar?node-id=1-2&t=UEJN130tMX1ss4Qw-1)

---