
<p align="center">
  <img src="assets/logo-claro.png" alt="Logo de Huellas al Hogar" width="220">
</p>

Este repositorio contiene la documentación y el desarrollo de **Huellas al Hogar**, organizado en ramas independientes para el frontend y backend del proyecto.

La rama `main` concentra la documentación general, los requerimientos, la arquitectura de navegación y las decisiones de diseño. Las ramas `frontend` y `backend` contienen sus respectivas implementaciones técnicas.

## Presentado por

- Alonso Troncoso
- Ricardo Vergara
- Claudio Vergara
- Benjamin Brito

## Índice

1. [Justificación del problema](#justificación-del-problema)
2. [Usuarios objetivo](#usuarios-objetivo-quién-usará-la-aplicación)
    - [Adoptantes](#adoptantes)
    - [Rescatistas](#rescatistas)
    - [Roles del sistema](#roles-del-sistema)
    - [Proto-personas](#proto-personas)
3. [Requerimientos](#requerimientos)
    - [Requerimientos funcionales por rol](#requerimientos-funcionales-por-rol)
    - [Funcionalidades transversales](#funcionalidades-transversales)
    - [Requerimientos no funcionales](#requerimientos-no-funcionales)
4. [Arquitectura de navegación](#arquitectura-de-navegación)
    - [Rutas principales y secundarias](#1-rutas-principales-y-secundarias)
    - [Relaciones jerárquicas entre vistas](#2-relaciones-jerárquicas-entre-vistas)
    - [Flujo de interacción entre pantallas](#3-flujo-de-interacción-entre-pantallas)
    - [Diferenciación de acceso según roles](#diferenciación-de-acceso-según-roles)
    - [Flujos de tareas](#flujos-de-tareas)
    - [Puntos críticos de interacción](#puntos-críticos-de-interacción)
    - [Coherencia de experiencia entre dispositivos](#coherencia-de-experiencia-entre-dispositivos)
    - [Justificación técnica](#justificación-técnica)
5. [Bocetos UI/UX](#bocetos-uiux)
6. [Frontend con Ionic-React](#frontend-con-ionic-react)

---

## Justificación del problema

El problema central de este proyecto corresponde a la tenencia irresponsable y la consecuente presencia de animales sin supervisión o en situación de abandono. En Chile, la **Ley N.º 21.020 sobre Tenencia Responsable de Mascotas y Animales de Compañía** establece obligaciones asociadas al cuidado, identificación y control responsable de las mascotas, relacionando esta materia con el bienestar animal, la salud pública, la seguridad de las personas y la protección del medio ambiente ([Biblioteca del Congreso Nacional de Chile, 2017](https://www.bcn.cl/leychile/navegar?idNorma=1106037)).

En la comuna de Santo Domingo existen antecedentes que permiten justificar la pertinencia local del problema. Un estudio realizado en 2015 a **553 viviendas del sector urbano de Santo Domingo** encontró que el 50,25 % de los hogares encuestados tenía perros y el 16,03 % tenía gatos. Dentro del mismo estudio, un 48,5 % de los participantes atribuyó principalmente a la comunidad la responsabilidad respecto de los perros vagos, mientras que la esterilización y la educación comunitaria aparecieron entre las soluciones propuestas ([Chávez Riquelme, 2019, Universidad de Concepción](https://repositorio.udec.cl/bitstreams/f5c433e5-ace5-49e0-987a-8b7bd5761ace/download)). Estos datos corresponden a un diagnóstico histórico y no deben interpretarse como una estimación actual de la población animal callejera.

La preocupación también tiene expresión institucional en la comuna. La Municipalidad de Santo Domingo dispone de una **Unidad de Zoonosis y Tenencia Responsable de Mascotas**, mantiene una ordenanza local sobre la materia y cuenta con mecanismos de denuncia asociados a tenencia responsable ([Municipalidad de Santo Domingo, Unidad de Zoonosis y Tenencia Responsable de Mascotas](https://santodomingo.cl/dimao/)). Además, la Subsecretaría de Desarrollo Regional y Administrativo realizó en Santo Domingo un **Diálogo Ciudadano de Tenencia Responsable de Mascotas** orientado a levantar necesidades locales y definir acciones junto con la comunidad ([SUBDERE, 2019](https://www.subdere.gov.cl/sala-de-prensa/mascota-protegida-realiza-charla-de-tenencia-responsable-en-santo-domingo)).

A nivel ambiental, investigaciones desarrolladas en Chile han documentado que los perros de libre desplazamiento pueden afectar a la fauna silvestre mediante depredación, competencia o transmisión de enfermedades, reforzando la relación entre tenencia responsable y protección del entorno ([Villatoro et al., 2019](https://doi.org/10.1016/j.jenvman.2018.06.035)).

Para efectos de diseño del proyecto, el equipo parte además del **supuesto inicial** de que parte de la información sobre rescate y adopción circula mediante canales informales o dispersos, como Facebook, Instagram y WhatsApp. Este supuesto orienta la propuesta de centralización de información, pero deberá validarse posteriormente mediante investigación con usuarios y no se presenta como un dato empírico comprobado.

En este contexto, **Huellas al Hogar** se propone como una plataforma web y móvil orientada a centralizar la publicación y búsqueda de animales en adopción, facilitar el proceso de solicitud, conectar a rescatistas con posibles adoptantes y entregar contenido educativo sobre tenencia responsable, abandono y cuidado animal.

---

## Usuarios objetivo (Quién usará la aplicación)

La aplicación considera principalmente dos grupos de usuarios que interactúan directamente con el proceso de adopción: **adoptantes** y **rescatistas**. Adicionalmente, se consideran visitantes sin registro y un rol de administrador para la gestión general de la plataforma.

### Adoptantes

Los adoptantes corresponden a ciudadanos que buscan un animal de compañía. Se considera que constituyen un grupo con diversas motivaciones, pero con la necesidad común de encontrar información clara, actualizada y suficiente sobre los animales disponibles antes de tomar la decisión de adoptar.

Dentro de este grupo pueden existir personas que:

- buscan animales con características específicas, como especie, tamaño, edad, sexo o ubicación;
- necesitan conocer los requerimientos de cuidado antes de tomar una decisión;
- requieren información sobre salud, comportamiento, convivencia y posibles cuidados especiales;
- necesitan un proceso de postulación claro y fácil de seguir;
- se frustran al contactar rescatistas en redes sociales o canales poco centralizados y no obtener respuesta o información actualizada.

#### Necesidades principales

Entre las necesidades identificadas para este grupo se encuentran:

- acceder a un catálogo visual de animales disponibles, evitando publicaciones antiguas o desactualizadas;
- filtrar opciones de adopción según sus preferencias;
- revisar una ficha detallada del animal antes de postular;
- disponer de un formulario estandarizado para solicitar una adopción sin salir de la plataforma;
- acceder a contenido educativo sobre tenencia responsable y consecuencias del abandono.

### Rescatistas

Los rescatistas son voluntarios independientes u organizaciones dedicadas a recoger, rehabilitar y reubicar animales.

A diferencia del adoptante, el rescatista tendrá acceso a funcionalidades relacionadas con la publicación de animales, la gestión de sus fichas y la revisión de solicitudes de adopción. Estas herramientas buscan centralizar información y reducir el tiempo dedicado a coordinar procesos mediante canales informales.

#### Necesidades principales

Entre las necesidades identificadas para este grupo se encuentran:

- crear publicaciones de manera sencilla, incorporando fotografías y datos relevantes del animal;
- recibir las solicitudes de adopción en un espacio centralizado;
- revisar ordenadamente la información de las personas interesadas;
- actualizar rápidamente el estado de un animal;
- editar o eliminar sus propias publicaciones cuando sea necesario.

---

## Roles del Sistema

- **Administrador:** Usuario encargado de la gestión general de la plataforma, verificación de rescatistas, moderación y gestión de contenido estático.
- **Rescatista:** Usuario autorizado para publicar animales en adopción, gestionar sus fichas, revisar solicitudes y modificar el estado de sus publicaciones.
- **Adoptante:** Usuario registrado habilitado para enviar solicitudes formales de adopción y consultar el estado de sus propias solicitudes.

**Usuario no registrado:** corresponde a un estado de acceso y no a un rol del sistema. Puede explorar animales, revisar sus fichas y consultar contenido educativo. También puede acceder al proceso de solicitud, pero deberá iniciar sesión antes de enviarla formalmente.

### Definición de conceptos

**Rol:** Define qué puede hacer un usuario dentro del sistema.

**Proto-persona:** Describe quién podría ser ese usuario, sus características, necesidades, objetivos, dificultades y contexto de uso.

---

## Proto-personas

Las siguientes proto-personas corresponden a **perfiles hipotéticos** construidos a partir del análisis del problema y de las características esperadas de los usuarios de **Huellas al Hogar**. No representan resultados obtenidos directamente de usuarios reales, sino una caracterización preliminar utilizada para orientar las decisiones de diseño y desarrollo. Por lo tanto, sus edades, hábitos, necesidades, frustraciones y contextos de uso se consideran **supuestos de diseño del equipo** y no datos empíricos sobre la población de Santo Domingo.

### Proto-persona 1: Ciudadana buscando un perro como mascota personal

**Nombre ficticio:** Antonia  
**Tipo de usuario o rol:** Adoptante

#### Características generales

Antonia tiene 28 años, es residente de la comuna y utiliza activamente redes sociales y plataformas digitales. Siempre se ha preocupado por el bienestar animal y ha tenido mascotas anteriormente.

Utiliza habitualmente plataformas digitales desde su teléfono móvil y está acostumbrada a interactuar mediante formularios, buscadores y botones de acción. Posee un nivel de experiencia tecnológica suficiente para utilizar aplicaciones y sitios web de uso cotidiano.

#### Necesidades principales

- Encontrar un perro de tamaño pequeño que se adapte a su estilo de vida y al espacio disponible en su hogar.
- Informarse sobre los cuidados requeridos antes de tomar la decisión de adoptar.
- Conocer el estado de salud del animal y si presenta enfermedades o necesidades de cuidado especial.
- Conocer claramente los requisitos y etapas del proceso de adopción.

#### Objetivos de uso

Utilizar la plataforma para buscar un animal de compañía, revisar información detallada sobre los animales disponibles, consultar contenido de tenencia responsable y enviar una solicitud formal de adopción que pueda ser revisada por el rescatista correspondiente.

#### Dificultades o puntos de frustración

Puede presentar dificultades o frustración cuando:

- encuentra publicaciones de adopción en redes sociales sin saber si el animal continúa disponible;
- pierde el contexto o la página del animal al momento de registrarse o iniciar sesión;
- los formularios de postulación son ambiguos o no indican claramente los errores;
- desconoce el estado de salud, comportamiento o cuidados especiales que requiere el animal.

#### Funcionalidades de la aplicación que utilizaría

- Lista de animales.
- Filtros de búsqueda por especie, edad, tamaño, sexo y ubicación.
- Búsqueda por nombre.
- Vista de detalle del animal.
- Formulario de solicitud de adopción.
- Consulta del estado de sus solicitudes.
- Lectura de contenido sobre tenencia responsable y consecuencias del abandono.

#### Dispositivo y contexto probable de acceso

Utilizaría principalmente un **teléfono móvil**, aunque también podría acceder desde un computador.

Podría utilizar la plataforma durante períodos de descanso, en el transporte público o desde su hogar.

---

### Proto-persona 2: Voluntario independiente y gestor de rescates

**Nombre ficticio:** Matias  
**Tipo de usuario o rol:** Rescatista

#### Características generales

Matias tiene 30 años y actúa como voluntario independiente acogiendo perros en situación de calle. Lleva varios años participando en actividades de rescate y coordina estas tareas junto con su trabajo formal.

Trabaja habitualmente desde un notebook y posee un nivel tecnológico intermedio. Valora herramientas simples que le permitan organizar la información de sus rescates sin dedicar demasiado tiempo a tareas administrativas.

#### Necesidades principales

- Crear perfiles o fichas de animales donde pueda registrar sus características, comportamiento, salud, cuidados especiales y antecedentes relevantes.
- Revisar ordenadamente las solicitudes de las personas interesadas en adoptar.
- Actualizar rápidamente si un animal se encuentra disponible, en proceso de adopción o adoptado.
- Modificar la información de una publicación cuando sea necesario.

#### Objetivos de uso

Gestionar un conjunto de publicaciones de animales rescatados y revisar centralizadamente la información de los adoptantes interesados para tomar mejores decisiones durante el proceso de reubicación.

#### Dificultades o puntos de frustración

Puede experimentar frustración cuando:

- pierde tiempo respondiendo mensajes informales por WhatsApp de personas que finalmente no cumplen los requisitos;
- debe ingresar repetidamente la misma información;
- no puede encontrar rápidamente una publicación;
- la plataforma no le permite actualizar de forma sencilla el estado de un animal.

#### Funcionalidades de la aplicación que utilizaría

- Formulario de publicación de animal.
- Gestión y visualización de sus propias publicaciones.
- Edición y eliminación de publicaciones.
- Revisión de solicitudes de adopción.
- Cambio de estado de un animal a **En proceso** o **Adoptado**.

#### Dispositivo y contexto probable de acceso

Utilizaría principalmente un **computador portátil o de escritorio** durante la noche o fines de semana para organizar la información de los rescates.

También podría utilizar un dispositivo móvil para realizar consultas o actualizar rápidamente el estado de un animal.

---

## Requerimientos

## Requerimientos Funcionales por Rol

Los requerimientos funcionales describen las acciones principales que deberá permitir el sistema. Para **Huellas al Hogar** se consideran los roles de administrador, rescatista y adoptante.

| ID        | Requerimiento funcional                                                                                                                                                                                                                                        | Rol           |
|-----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|
| **RF-01** | El sistema deberá permitir al rescatista crear publicaciones de animales mediante un formulario que permita subir fotografías y registrar datos específicos, como especie, edad, tamaño, salud, cuidados especiales, comportamiento y antecedentes relevantes. | Rescatista    |
| **RF-02** | El sistema deberá proveer una vista de **Lista de animales** y permitir aplicar filtros de búsqueda por especie, edad, tamaño, sexo y ubicación, además de búsqueda por nombre.                                                                                | Todos         |
| **RF-03** | El sistema deberá permitir al adoptante completar y enviar un formulario formal de solicitud de adopción asociado al animal seleccionado.                                                                                                                      | Adoptante     |
| **RF-04** | El sistema deberá permitir al rescatista visualizar y revisar ordenadamente las solicitudes de adopción recibidas para sus publicaciones.                                                                                                                      | Rescatista    |
| **RF-05** | El sistema deberá permitir al rescatista modificar el estado de un animal publicado a **En proceso** o **Adoptado**, reflejando dicho estado en la plataforma y evitando solicitudes innecesarias.                                                             | Rescatista    |
| **RF-06** | El sistema deberá proporcionar al administrador herramientas para crear, editar o eliminar contenido estático relacionado con tenencia responsable y consecuencias del abandono.                                                                               | Administrador |
| **RF-07** | El sistema deberá permitir al administrador visualizar a los usuarios registrados, asignar el rol oficial de rescatista, moderar usuarios y eliminar publicaciones que incumplan las normas.                                                                   | Administrador |
| **RF-08** | El sistema deberá permitir al adoptante visualizar un historial con el estado de sus propias solicitudes de adopción: pendiente, aprobada o rechazada.                                                                                                         | Adoptante     |
| **RF-09** | El sistema deberá permitir al rescatista editar o eliminar sus propias publicaciones cuando necesite actualizar la información de un animal.                                                                                                                   | Rescatista    |

---

### Funcionalidades Transversales

Las siguientes funcionalidades son necesarias para el funcionamiento general de la aplicación, pero no forman parte de los requerimientos funcionales principales del dominio.

- **FT-01:** El sistema deberá permitir el registro de usuarios en la plataforma.
- **FT-02:** El sistema deberá permitir a los usuarios iniciar sesión. Un usuario no registrado podrá explorar los animales y acceder al proceso de solicitud, pero deberá autenticarse antes de enviar formalmente una solicitud de adopción.
- **FT-03:** El sistema deberá permitir cerrar una sesión activa.
- **FT-04:** El sistema deberá restringir las funcionalidades disponibles de acuerdo con el rol del usuario autenticado.

---

## Requerimientos No Funcionales

Los requerimientos no funcionales establecen condiciones de calidad que deberá cumplir la plataforma. Para que puedan ser verificados, cada uno incluye un criterio observable o un umbral medible.

### UX y Usabilidad

#### RNF-UX-01 — Diseño adaptable (Responsive)

La interfaz deberá adaptarse correctamente a pantallas móviles desde **360 px de ancho** y a pantallas de escritorio de hasta **1440 px**, sin generar desplazamiento horizontal no intencional. Las funcionalidades principales deberán permanecer accesibles en ambos formatos.

**Criterio de verificación:** en pruebas manuales realizadas a 360 px, 390 px, 768 px, 1024 px y 1440 px de ancho, no deberán existir elementos principales cortados, superpuestos o inaccesibles.

#### RNF-UX-02 — Prevención y retroalimentación de errores

En los formularios críticos, como **Publicar animal** y **Solicitud de adopción**, el sistema no deberá permitir el envío mientras existan campos obligatorios inválidos. Los campos con errores deberán destacarse visualmente y mostrar un texto de ayuda (*helper text*) indicando qué debe corregirse.

**Criterio de verificación:** el **100 % de los campos obligatorios inválidos** deberá mostrar un mensaje de error asociado antes de permitir el envío del formulario.

#### RNF-UX-03 — Conservación de contexto

Durante el flujo de adopción, un usuario no registrado podrá avanzar hasta la solicitud. Si intenta enviarla sin estar autenticado, el sistema deberá solicitar el inicio de sesión y, tras autenticarse correctamente, devolverlo al mismo proceso sin obligarlo a buscar nuevamente al animal.

**Criterio de verificación:** en el **100 % de las pruebas del flujo de autenticación desde una solicitud**, el sistema deberá conservar el animal seleccionado y retornar al usuario al formulario correspondiente.

#### RNF-UX-04 — Navegación clara y consistente

El sistema deberá utilizar navegación contextual en las vistas secundarias. Por ejemplo, en el detalle del animal se utilizará **“Volver a adopciones”** y, en la solicitud, **“Volver al perfil”**, evitando depender exclusivamente del botón de retroceso del navegador.

**Criterio de verificación:** el **100 % de las vistas secundarias definidas en el prototipo** deberá contar con una acción visible de regreso al nivel anterior del flujo.

---

### Seguridad

#### RNF-SEG-01 — Protección de contraseñas

Las contraseñas de administradores, rescatistas y adoptantes deberán almacenarse utilizando un mecanismo seguro de hash y nunca deberán guardarse en texto plano. Durante el ingreso de la contraseña, el contenido deberá mostrarse oculto por defecto.

**Criterio de verificación:** ninguna contraseña deberá almacenarse o registrarse en texto plano. El backend deberá utilizar **Argon2id o bcrypt con un factor de costo igual o superior a 12**, y los campos de contraseña deberán utilizar entrada oculta por defecto.

#### RNF-SEG-02 — Protección de información sensible

Los datos personales ingresados en el formulario de solicitud de adopción, como teléfono y correo electrónico, deberán transmitirse de forma segura entre el frontend y el backend.

**Criterio de verificación:** en ambiente desplegado, el **100 % de las comunicaciones que contengan datos personales** deberá utilizar **HTTPS con TLS 1.2 o superior**, y dichos datos no deberán incluirse en parámetros visibles de la URL.

#### RNF-SEG-03 — Autorización estricta por roles

El backend deberá verificar el rol y la autoría antes de procesar una acción. Un rescatista solo podrá editar, eliminar o cambiar el estado de los animales que él mismo haya publicado. Del mismo modo, un adoptante no podrá modificar información correspondiente a publicaciones de rescatistas.

**Criterio de verificación:** el **100 % de las solicitudes no autorizadas** sobre recursos protegidos deberá ser rechazado por el backend con una respuesta de acceso denegado (`403`) o no autenticado (`401`), según corresponda.

---

### Rendimiento

#### RNF-REN-01 — Carga optimizada del catálogo de animales

La vista **Lista de animales** deberá cargarse de forma fluida junto con sus fotografías, evitando tiempos de espera que interrumpan la navegación normal del usuario.

**Criterio de verificación:** con una conexión estable equivalente a **4G** y una carga inicial de hasta **24 animales**, el contenido principal del catálogo deberá estar disponible en un tiempo máximo de **3 segundos**. Las imágenes que se encuentren fuera del área visible deberán cargarse de forma diferida (*lazy loading*) cuando corresponda.

---

### Compatibilidad

#### RNF-COM-01 — Soporte de navegadores

La plataforma deberá funcionar correctamente y sin pérdida de estilos o funcionalidades principales en navegadores móviles y de escritorio.

**Criterio de verificación:** la aplicación deberá ser probada en la **versión estable actual y la versión inmediatamente anterior** de Google Chrome, Safari, Mozilla Firefox y Microsoft Edge, sin presentar errores críticos que impidan completar los flujos principales de adopción, publicación y autenticación.

---

## Arquitectura de Navegación

### 1. Rutas principales y secundarias

El sistema utiliza una estructura jerárquica que parte desde la pantalla de inicio y se distribuye hacia las distintas funcionalidades de la plataforma.

Las principales secciones de navegación son:

- **Adopciones**
- **Aprende**
    - Tenencia responsable
    - Consecuencias del abandono
- **Publicar animal**
- **Perfil**
- **Inicio de sesión / Registro**

Dentro de estas secciones se encuentran vistas secundarias asociadas a las funcionalidades de la plataforma.

### 2. Relaciones jerárquicas entre vistas

La organización general de las vistas sigue la siguiente estructura:

```text
Aplicación
│
├── Rutas públicas
│   ├── Inicio
│   ├── Adopciones
│   │   └── Lista de animales
│   │       └── Detalle del animal
│   │           └── Solicitud de adopción
│   ├── Aprende
│   │   ├── Tenencia responsable
│   │   │   └── Artículo / contenido
│   │   └── Consecuencias del abandono
│   ├── Inicio de sesión
│   └── Registro
│
└── Rutas protegidas
    ├── Adoptante
    │   └── Perfil
    │       └── Mis solicitudes
    │
    ├── Rescatista
    │   ├── Publicar animal
    │   ├── Mis publicaciones
    │   └── Solicitudes recibidas
    │
    └── Administrador
        ├── Gestión de usuarios
        ├── Moderación de publicaciones
        └── Gestión de contenido educativo
```

### 3. Flujo de interacción entre pantallas

#### Navegación global

En la versión de escritorio se utilizará una **Barra de Navegación Superior (Topbar)** con la siguiente estructura principal:

```text
Logo | Adopciones | Aprende ▼ | Publicar Animal | Iniciar sesión / Perfil
```

La opción **Aprende** agrupa:

- Tenencia responsable.
- Consecuencias del abandono.

La barra superior permite acceder a las funcionalidades principales sin sobrecargar la navegación con enlaces secundarios.

#### Navegación secundaria

En las vistas secundarias se utilizarán controles contextuales de regreso en lugar de breadcrumbs.

Ejemplos:

- **Volver a adopciones** desde el detalle de un animal.
- **Volver al perfil** desde la solicitud de adopción.

La navegación entre vistas será gestionada mediante `react-router-dom`.

---

## Diferenciación de acceso según roles

La plataforma considera diferentes niveles de acceso de acuerdo con el tipo de usuario.

### Usuario no registrado

Tiene acceso a:

- Inicio.
- Lista de animales.
- Detalle de los animales.
- Tenencia responsable.
- Consecuencias del abandono.
- Inicio del proceso de solicitud de adopción.

Puede completar el flujo hasta la solicitud, pero deberá iniciar sesión antes de enviarla formalmente.

---

### Adoptante

Tiene acceso a las mismas secciones disponibles para un usuario no registrado.

Además, al encontrarse autenticado podrá:

- enviar solicitudes de adopción;
- consultar el estado de sus solicitudes.

---

### Rescatista

Utiliza la plataforma como herramienta para dar animales en adopción.

Solo tiene control sobre el contenido que él mismo crea.

Puede:

- publicar animales mediante un formulario;
- gestionar sus publicaciones;
- editar o eliminar sus propias publicaciones;
- cambiar el estado de un animal a **Adoptado** o **En proceso**;
- revisar las solicitudes recibidas para los animales que haya publicado.

---

### Administrador

Tiene acceso a funciones generales de gestión y moderación.

Puede:

- visualizar usuarios registrados;
- asignar roles;
- otorgar el rol oficial de rescatista;
- moderar usuarios que hagan mal uso del sitio;
- editar o eliminar publicaciones que incumplan las normas;
- gestionar contenido estático como **Tenencia responsable** y **Consecuencias del abandono**.

---

## Flujos de Tareas

### Task Flow 1: Proceso de adopción

**Rol:** Usuario no registrado / Adoptante

**Objetivo:** explorar animales disponibles y enviar una solicitud formal de adopción.

```text
Inicio
  ↓
Adopciones
  ↓
Lista de animales
  ↓
Aplicar filtros o búsqueda (opcional)
  ↓
Seleccionar animal
  ↓
Detalle del animal
  ↓
Solicitar adopción
  ↓
Formulario de solicitud
  ↓
Completar información
  ↓
¿Usuario autenticado?
   ↓            ↓
  No            Sí
   ↓             ↓
Iniciar        Validar
sesión         formulario
   ↓             ↓
Retomar        Enviar solicitud
solicitud        ↓
          Mostrar confirmación
```

---

### Task Flow 2: Publicación y gestión de un animal

**Rol:** Rescatista

**Objetivo:** publicar un animal y gestionar posteriormente su información.

```text
Inicio de sesión
  ↓
Publicar animal
  ↓
Completar formulario
  ↓
Agregar fotografías y datos
  ↓
Validar información
  ↓
Publicar
  ↓
Mis publicaciones
  ↓
Editar / Eliminar / Cambiar estado
```

---

### Puntos críticos de interacción

Los principales puntos críticos de interacción identificados son:

1. **Solicitud de adopción:** el formulario debe mantener una estructura clara, dividir la información por secciones y mostrar errores de forma comprensible.

2. **Inicio de sesión dentro del flujo de adopción:** un usuario no registrado debe poder llegar hasta la solicitud y ser informado de que necesita iniciar sesión únicamente antes del envío formal, evitando perder el contexto del animal seleccionado.

3. **Publicación de animal:** el rescatista debe poder identificar claramente qué información es obligatoria y recibir retroalimentación frente a errores de validación.

4. **Actualización del estado del animal:** los estados **En adopción**, **En proceso** y **Adoptado** deberán visualizarse de forma clara y consistente.

5. **Filtros del catálogo:** la aplicación de filtros deberá ser comprensible y permitir al usuario identificar fácilmente qué criterios se encuentran activos.

---

### Coherencia de experiencia entre dispositivos

La aplicación se diseñará utilizando principios de **Responsive Web Design**, manteniendo las mismas funcionalidades principales en las versiones web y móvil.

En escritorio, la navegación principal se presenta mediante una Topbar con las opciones visibles.

En dispositivos móviles, la navegación deberá reorganizarse utilizando componentes adaptables de Ionic. Las grillas, formularios, filtros y galerías también deberán ajustarse al espacio disponible sin perder jerarquía ni funcionalidad.

Los patrones, etiquetas y acciones principales deberán mantenerse consistentes entre dispositivos.

---

### Justificación Técnica

La arquitectura considera decisiones relacionadas con usabilidad, eficiencia de interacción, claridad estructural y escalabilidad del frontend.

#### Usabilidad y claridad

La Topbar agrupa las opciones principales y utiliza **Aprende** como categoría para reunir el contenido educativo, evitando sobrecargar la navegación.

Las vistas secundarias emplean controles contextuales como **Volver a adopciones** y **Volver al perfil**, manteniendo claro el lugar desde el cual llegó el usuario.

#### Eficiencia de interacción

El usuario puede explorar animales y acceder al formulario de solicitud sin necesidad de iniciar sesión previamente. La autenticación se solicita únicamente antes del envío formal, reduciendo interrupciones durante la exploración.

Los filtros de la vista de adopciones permiten acotar el catálogo por especie, edad, tamaño, sexo y ubicación, además de buscar por nombre.

#### Claridad estructural

Las funcionalidades se agrupan según el objetivo del usuario:

- **Adopciones:** exploración, detalle y solicitud.
- **Aprende:** contenido educativo.
- **Publicar animal:** creación de publicaciones para rescatistas.
- **Perfil:** acceso a solicitudes y publicaciones asociadas al usuario.

#### Escalabilidad frontend

Separar las vistas en rutas independientes mediante `react-router-dom` permitirá mantener una estructura modular, compartir enlaces directos y extender funcionalidades sin modificar la navegación principal.

---

## Bocetos UI/UX

El diseño de la interfaz de **Huellas al Hogar** se desarrolló en Figma, considerando la estructura de navegación definida para el proyecto, la adaptación entre versión web y móvil y la coherencia visual entre las distintas vistas.

El archivo de Figma se encuentra organizado en tres páginas:

- **Mockups:** contiene las interfaces de alta fidelidad.
- **Wireframes:** contiene los bocetos de baja fidelidad utilizados para definir la estructura y distribución de las pantallas.
- **Guía de estilo:** contiene la paleta de colores, tipografías, logotipo y referencias visuales del proyecto.

[**Ver diseño y prototipo de Huellas al Hogar en Figma**](https://www.figma.com/design/9Jc4zhePHD6VnFI5WZZ94f/Huellas-al-Hogar?node-id=1-2&t=UEJN130tMX1ss4Qw-1)

---

## Frontend con Ionic-React

Se desarrolló la estructura base del frontend en **Ionic con React**, utilizando React Router para gestionar la navegación y una arquitectura modular por carpetas.

### Requisitos

- Node.js 20 o superior.
- npm 10 o superior.

### Instalación y ejecución

```bash
npm install
npm run dev
```

Para compilar en producción:

```bash
npm run build
npm run preview
```

### Estructura del proyecto

```text
src/
├── components/
├── contexts/
├── pages/
├── routes/
├── theme/
├── App.tsx
├── main.tsx
├── ...
└── ...
```

### Rutas implementadas

Las siguientes rutas corresponden a la estructura actualmente implementada en el frontend:

| Ruta                    | Acceso                     | Descripción                                |
|-------------------------|----------------------------|--------------------------------------------|
| `/inicio`               | Público                    | Landing principal                          |
| `/adopciones`           | Público                    | Catálogo de animales                       |
| `/adopciones/:animalId` | Público                    | Detalle de adopción                        |
| `/educacion`            | Público                    | Contenido educativo / tenencia responsable |
| `/login`                | Público                    | Inicio de sesión                           |
| `/perfil`               | Protegido                  | Perfil del usuario                         |
| `/publicar`             | Rescatista / Administrador | Publicación de animales                    |

### Consideraciones

- La navegación se gestiona con `react-router-dom`.
- Las rutas sensibles se protegen mediante `ProtectedRoute`.
- Si un usuario no autenticado intenta acceder directamente a una ruta protegida, se redirige a `/login`.
- El flujo de adopción permite llegar hasta la solicitud sin iniciar sesión; la autenticación se requiere antes del envío formal.
- La lógica de sesión actual es una simulación local para esta etapa y servirá como base para la autenticación mediante JWT en el backend.

### Tecnologías y herramientas utilizadas

- **Frontend:** Ionic Framework + React + TypeScript.
- **Navegación:** React Router (`react-router-dom`).
- **Diseño UI/UX:** Figma.
- **Control de versiones:** GitHub.

### Resultado

La aplicación cuenta con una base funcional de frontend en Ionic + React, una estructura modular y una navegación coherente con la propuesta de **Huellas al Hogar**.