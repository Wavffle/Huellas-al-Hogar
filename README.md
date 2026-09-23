# Huellas-al-Hogar
Plataforma web y móvil orientada a fomentar la adopción y tenencia responsable de animales, entregando información preventiva sobre el abandono, el cuidado animal y las consecuencias de la proliferación de animales callejeros.


# **Arquitectura de Navegación y Experiencia del Usuario**
_**Definición de rutas principales, secundarias y jerarquía de vistas**_

El sistema utiliza una estructura de árbol, partiendo desde un punto de inicio hacia las diferentes ramas del contenido que ofrece la página web. A continuación, se presenta el esquema empleado:
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
_**Flujo de interaccion entre pantallas**_  

-**Navegación Global:** se utilizará una Barra de Navegación Superior (Topbar) estática para acceder rápidamente a las ramas principales (Adopciones, Tenencia, Publicar, Perfil). Esta barra agiliza la navegación en la página web.

-**Navegación Secundaria:** al entrar en los detalles del animal o a un artículo, la vista cambiará apoyada en el enrutador (`react-router`), manteniendo visible un sistema de _breadcrumbs_ (por ejemplo, `Inicio > Adopciones > Max`) o un botón claro de "Volver al listado" en la esquina superior izquierda para evitar que el usuario dependa del botón de retroceso del navegador.

_**Diferenciación de acceso según roles**_

- **Usuario no registrado:** tiene acceso a "Lista de animales", "Detalles", "Tenencia responsable" y "Consecuencias del abandono". Sin embargo, si deseara adoptar un animal tendrá que iniciar sesión.

- **Adoptante:** al igual que en el caso anterior, el adoptante tiene acceso a las mismas secciones. La diferencia es que el Adoptante está habilitado para adoptar debido a que se encuentra registrado en el sitio web.

- **Rescatista:** utiliza la plataforma como herramienta para dar animales en adopción. Solo tiene control de lo que él crea. Puede publicar animales (accediendo al formulario para subir fotos y datos del perro o gato que rescató), gestionar sus publicaciones, cambiar estado (marcar un animal como "Adoptado" o "En proceso" para que ya no salga en la lista principal), revisar solicitudes (leer los formularios de personas que quieren adoptar sus animales pulicados).

- **Administrador:** tiene control total de los usuarios ya que puede ver a todos aquellos registrados, asignar roles (p. ej. darle el "check" oficial a una cuenta que sea Rescatista) o _banear_ usuarios que hagan mal uso del sitio. Posee moderación global debido a que puede editar o borrar cualquier publicación de un rescatista si este incumple las normas (como subir fotos falsas o inapropiadas). Por último, puede gestionar contenido estático como "Tenencia responsable" o "Consecuencias del abandono" puesto que el administrador es quien crea, edita o borra esos artículos.

_**Flujo principal de tareas**_
_Proceso de adopción_

1. El usuario navega en `Lista de animales` aplicando opcionalmente filtros desde la barra lateral.
2. Hace click en una tarjeta e ingresa al `Detalle del animal`.
3. Lee la información y presiona el botón `Adoptar`.
4. Si esta registrado, pasa a `Solicitud de adopción` (formulario); caso contrario, se despliega una ventana modal de Login.
5. Completa el formulario y lo envía. El sistema muestra un mensaje de éxito y lo retorna a la lista de animales.

_**Puntos críticos de interacción**_  

Los formularios de `Publicar animal` y `Solicitud de adopción son críticos`. Si un usuario comete un error, el formulario no se enviará, los campos erróneos se resaltarán con bordes rojos y se mostrará un texto de ayuda (helper text) debajo del campo indicando qué falta corregir.

_**Coherencia de experiencia entre dispositivos**_
Al ser una aplicación web, se utilizarán patrones de diseño responsivos (Responsive Web Design). En pantallas de escritorio, el Navbar mostrará todos los enlaces desplegados. Si el usuario accede a la web desde un dispositivo móvil, el Navbar colapsará automáticamente en un botón de "Menú Hamburguesa" utilizando componentes adaptables de Ionic como IonMenu e IonHeader.

_**Justificación técnica de decisiones adoptadas**_
- **Usabilidad y claridad:** la barra superior mantiene las opciones a la vista todo el tiempo en la web, reduciendo la carga cognitiva.
- **Eficiencia:** usar modales para el login durante el flujo de adopción evita que el usuario abandone la página del animal, perdiendo el contexto de lo que estaba haciendo.
- **Escalabilidad frontend:** separar vistas en rutas independientes (`react-router`) permite a futuro compartir enlaces directos a animales específicos, lo que es vital para una página web.

_**Tecnologías y herramientas utilizadas**_
- **Frontend:** Ionic Framework + React + TypeScript (Enfocado en Web/PWA).
- **Navegación:** React Router (react-router-dom).
- **Diseño UI:** Figma.
- **Control de Versiones:** GitHub.
