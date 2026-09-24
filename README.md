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

## Justificación del problema

El problema central de este proyecto sobre la tenencia irresponsable y la consecuente proliferación de animales callejeros radica en una generación de distintos problemas a los cuales se enfrenta la comunidad de santo domingo, siendo estos riesgos a la salud pública (como enfermedades zoonóticas o transmitidas por estos animales, como la acumulación de heces), un impacto negativo en la fauna silvestre por las jaurías de animales que se desarrollan, y un aumento de la percepción de inseguridad de los peatones y el aumento de accidentes de transito debido a la alta población de animales en situación calle.

Esta problemática se agrava por una gran dificultad actual: al momento de intentar rescatar, reubicar o dar en adopción a estos animales, los ciudadanos y rescatistas utilizan canales de comunicación informales como Facebook, Instagram o WhatsApp. Estos métodos no presentan un formato estándar, provocando pérdida de información, publicaciones duplicadas y nula trazabilidad sobre si un animal ya fue adoptado o sigue disponible. Al no existir un sistema centralizado, los rescatistas pierden tiempo gestionando mensajes desordenados y los animales no consiguen la visibilidad necesaria para encontrar un hogar definitivo de forma ágil. 

Actualmente, esta falta de un canal eficiente para gestionar animales en estado de abandono, coordinar adopciones y educar a la población dificulta enormemente el control de la población animal por parte de las organizaciones correspondientes. Por lo tanto, una solución tecnológica a través de una página web utilizada como plataforma centralizada de adopción y educación (Huellas al hogar) permitirá conectar directamente a los rescatistas con los adoptantes, optimizando el proceso de adopción, reduciendo el abandono y promoviendo la tenencia responsable en la comunidad.

---

## Usuarios objetivo (Quién usará la aplicación)

La aplicación considera como los mas importantes a dos grupos de usuarios que interactúan directamente con los animales: adoptantes y rescatistas. Adicionalmente, se consideran visitantes sin registro y un rol de administrador para la gestión general de la plataforma.

### Adoptantes

Los adoptantes corresponden a ciudadanos que buscan un animal de compañía. Se considera que constituyen un grupo con diversas motivaciones, pero con la necesidad común de encontrar información clara y veraz sobre los animales disponibles, osea con objetivo de adoptar una mascota.

Dentro de este grupo pueden existir personas que:

- buscan animales con características específicas (tamaño, edad, compatibilidad con niños).

- necesitan conocer los requerimientos de cuidado antes de tomar una decisión (si el animal presenta alguna enfermedad o tratado especifico).

- requieren un proceso de postulación claro y fácil de seguir.

- se frustran al contactar rescatistas en redes sociales o sitios poco centralizados al no obtener respuesta.

#### Necesidades principales

Entre las necesidades identificadas para este grupo se encuentran:

- acceder a un catálogo visual de animales disponibles, libre de publicaciones antiguas o ya adoptadas.

- filtrar opciones de adopción según sus preferencias (especie, tamaño).

- disponer de formularios estandarizados para postular a una adopción sin salir de la plataforma.

- acceder a contenido educativo sobre tenencia responsable.

### Rescatistas

Los rescatistas son voluntarios independientes u organizaciones dedicadas a recoger, rehabilitar y reubicar animales.

A diferencia del adoptante, el rescatista tendrá acceso a funcionalidades relacionadas con la creación de fichas de animales y la evaluación de solicitudes, requiriendo herramientas ágiles para optimizar su tiempo limitado, o sea es quien hará los reportes.

#### Necesidades principales
Entre las necesidades identificadas para este grupo se encuentran:

- crear publicaciones de manera sencilla subiendo fotografías y datos.

- recibir todas las solicitudes de adopción en un panel centralizado.

- actualizar rápidamente el estado de un animal para evitar solicitudes innecesarias

- asegurar que los adoptantes lean las condiciones antes de postular.

---

## Roles del Sistema

- Administrador: Usuario encargado de la gestión general de la plataforma, verificación de rescatistas y creación de contenido estático (artículos).

- Rescatista: Usuario autorizado para publicar animales en adopción, gestionar sus fichas y revisar solicitudes de los adoptantes.

- Adoptante: Usuario registrado habilitado para enviar solicitudes formales de adopción.

- Usuario no registrado: Visitante que solo puede visualizar el catálogo de animales y leer artículos informativos.

### Definición de conceptos

**Rol**: Define qué puede hacer un usuario dentro del sistema.

**Proto-persona**: Describe quién podría ser ese usuario, sus características, necesidades, objetivos, dificultades y contexto de uso.

---

## Proto-Personas

En este apartado se presentan dos perfiles de proto personas hipoteticos a la utilizacion de la aplicacion "Huellas al hogar", con el objetivo de intentar predecir dificultades o frustraciones y necesidades que podrían presentar.

### Proto-persona 1: **Ciudadana buscando un perro como mascota personal**

Nombre ficticio: Antonia

Rol del usuario: Adoptante

#### Características generales

Antoniaa tiene 28 años, es residente de la comuna y activa en redes sociales. Siempre se ha preocupado por el bienestar animal, llegando a tener 3 mascotas anteriormente. Utiliza habitualmente plataformas digitales desde su teléfono móvil y está acostumbrada a interactuar mediante formularios y botones rápidos, o sea, se maneja bastante bien en el area de la tecnología.

#### Necesidades principales

- Encontrar un perro de tamaño pequeño que se adapte a su estilo de vida, ya que presenta un hogar con un patio de espacio reducido.
- Informarse bien sobre los cuidados requeridos antes de tomar la decisión de adoptar y el estado del animal que adoptará (si presenta enfermedades o padecimientos que se deban tener en cuenta al momento del cuidado).
- Conocer exactamente qué espera el rescatista del proceso de adopción, o sea, los requisitos para poder adaptar a este perro.

#### Objetivos de uso

Utilizar la plataforma para buscar un animal de compañía, leer artículos sobre cuidados básicos tanto especificos para su perro, como para otras razas, y enviar una solicitud formal de adopción que sea revisada de manera seria por los rescatistas.

#### Dificultades o puntos de frustración

Puede presentar dificultades o frustración cuando:
- ve publicaciones de adopción en Facebook sin saber si el animal ya fue adoptado;
- pierde el contexto o la página del animal cuando la aplicación la obliga a registrarse;
- los formularios de postulación son ambiguos o no le indican si cometió un error al llenarlos.
- Desconoce el estado del animal, si presenta alguna enfermedad, o si tiene algun tratado especial debido a sucesos pasados que haya sufrido.

#### Funcionalidades de la aplicación que utilizaría

- Lista de animales.
- Filtros de búsqueda (especie, tamaño).
- Vista de detalle del animal.
- Formulario de solicitud de adopción.
- Lectura de artículos de tenencia responsable.

#### Dispositivo y contexto probable de acceso

Utilizaría principalmente un teléfono móvil (navegador web).
Podría acceder durante períodos de descanso, en el transporte público o desde su casa.

---
### Proto-persona 2: **Voluntario independiente y gestor de rescates**

Nombre ficticio: Matias

Tipo de usuario o rol: Rescatista de animales

#### Características generales

Matias tiene 30 años y actúa como voluntario independiente acogiendo perros en situación de calle, lleva participando de este acto voluntario varios años. Trabaja habitualmente desde un notebook. Posee un nivel tecnológico no tan avanzado, por lo que valoraría el uso de una herramienta que le facilite el difundir sus rescates, ya que estos los cordina junto con su trabajo formal, el cual no pertenece al área de rescate de animales, facilitar esta acción le daría mas esperanza a los animales, y mejor gestión a Matias.

#### Necesidades principales

- Crear perfiles o fichas de animales, donde pueda mencionar las caracteristicas del animal, su comportamiento, si padece enfermedades, etc.
- Revisar ordenadamente las solicitudes de las personas interesadas, pudiendo revisar que la gente interesada cumpla con los requisitos de adopción que vea pertinente Matias.
- Actualizar rápidamente si un animal ya entró en proceso de adopción.

#### Objetivos de uso

Gestionar un conjunto de publicaciones de animales rescatados y revisar centralizadamente la información de los adoptantes interesados para tomar mejores decisiones de reubicación.

#### Dificultades o puntos de frustración

Puede experimentar frustración cuando:
- pierde mucho tiempo respondiendo mensajes informales por WhatsApp de personas que no cumplen los requisitos.
- debe ingresar repetidamente la misma información para cada animal.
- la plataforma no le permite ocultar fácilmente a un animal que ya fue adoptado.

#### Funcionalidades de la aplicación que utilizaría

- Formulario de publicación de animal.
- Gestión y vista de sus propias publicaciones.
- Revisión de listado de solicitudes de adopción.
- Cambio de estado de un animal (Adoptado / En proceso).

#### Dispositivo y contexto probable de acceso

Utilizaría principalmente un computador portátil o de escritorio durante la noche o fines de semana para organizar la información recabada en los rescates, la accesibilidad en cualquier medio le podría facilitar la actualización del estado del animal (adoptado o por adoptar).

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
