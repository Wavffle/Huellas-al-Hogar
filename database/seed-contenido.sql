-- Contenido de las páginas "Educación" y "Consecuencias del abandono".
-- Ejecutar DESPUÉS de schema.sql:  psql -U postgres -d huellas-al-hogar -f database/seed-contenido.sql
-- Es seguro repetirlo: si un bloque ya existe, se actualiza con el texto de este archivo.
--
-- Primera línea: fuerza UTF-8 para que los acentos se guarden bien aunque la consola de
-- Windows use otra codificación.
SET client_encoding = 'UTF8';

INSERT INTO bloques_contenido (seccion, orden, titulo, texto, destacado, imagen, alt) VALUES
  ('CUIDADOS', 1, 'Alimentación e hidratación', 'Una alimentación adecuada y acceso permanente a agua limpia son parte fundamental del bienestar del animal. Sus necesidades pueden variar según su edad, tamaño y estado de salud.', NULL, 'cuidado-alimentacion', 'Un corgi y un gatito comiendo del mismo plato'),
  ('CUIDADOS', 2, 'Salud y cuidados veterinarios', 'Los controles veterinarios permiten prevenir y detectar problemas de salud. Vacunación, desparasitación y atención oportuna forman parte del cuidado durante toda su vida.', NULL, 'cuidado-salud', 'Un cachorro y dos gatitos junto a un veterinario con estetoscopio'),
  ('CUIDADOS', 3, 'Esterilización e identificación', 'La esterilización contribuye al control de la reproducción no planificada. Mantener al animal correctamente identificado también facilita su regreso al hogar en caso de pérdida.', NULL, 'cuidado-esterilizacion', 'Un gato con collar isabelino siendo atendido'),
  ('CUIDADOS', 4, 'Espacio, ejercicio y enriquecimiento', 'Perros y gatos necesitan espacios seguros, actividad física y oportunidades para jugar, explorar y expresar sus comportamientos naturales.', NULL, 'cuidado-espacio', 'Una mujer haciendo yoga junto a su perro'),
  ('CUIDADOS', 5, 'Convivencia responsable', 'Antes de adoptar es importante considerar el tiempo disponible, las características del hogar y las necesidades del animal. La decisión debe involucrar a quienes convivirán con él.', NULL, 'cuidado-convivencia', 'Un perro y un gato frente a frente en el pasto'),
  ('PREGUNTAS', 1, NULL, '¿Tengo tiempo para cuidarlo todos los días?', 'todos los días', 'pregunta-tiempo', NULL),
  ('PREGUNTAS', 2, NULL, '¿Puedo asumir sus gastos durante toda su vida?', 'toda su vida', 'pregunta-gastos', NULL),
  ('PREGUNTAS', 3, NULL, '¿Mi vivienda es adecuada para sus necesidades?', 'adecuada', 'pregunta-vivienda', NULL),
  ('PREGUNTAS', 4, NULL, '¿Estoy preparado para acompañarlo incluso cuando aparezcan dificultades?', 'aparezcan dificultades', 'pregunta-dificultades', NULL),
  ('NECESIDADES', 1, NULL, 'Tiempo', NULL, NULL, NULL),
  ('NECESIDADES', 2, NULL, 'Cuidado', NULL, NULL, NULL),
  ('NECESIDADES', 3, NULL, 'Seguridad', NULL, NULL, NULL),
  ('NECESIDADES', 4, NULL, 'Afecto', NULL, NULL, NULL),
  ('NECESIDADES', 5, NULL, 'Un hogar estable', NULL, NULL, NULL),
  ('ESTADISTICAS', 1, '+ 100.000', 'animales se encuentran en situación de abandono en Chile cada año.', NULL, 'stat-animales', NULL),
  ('ESTADISTICAS', 2, 'Solo 1 de cada 10', 'animales en situación de calle logra ser adoptado.', NULL, 'stat-adopcion', NULL),
  ('ESTADISTICAS', 3, 'Miles', 'enfrentan hambre, enfermedades y peligros cada día.', NULL, 'stat-sufrimiento', NULL),
  ('FUENTE', 1, NULL, 'Subdere (2022). Estimaciones sobre población de perros y gatos en situación de abandono en Chile', NULL, NULL, NULL),
  ('CONSECUENCIAS', 1, 'Problemas de salud', 'Los animales abandonados están expuestos a enfermedades, parásitos, desnutrición y falta de atención veterinaria.', NULL, 'consecuencia-salud', 'Perros y gatos comiendo en el suelo de una calle'),
  ('CONSECUENCIAS', 2, 'Riesgos en su entorno', 'Enfrentan peligros como accidentes, maltrato, peleas con otros animales y condiciones climáticas extremas.', NULL, 'consecuencia-riesgos', 'Cachorros refugiados entre objetos y basura'),
  ('CONSECUENCIAS', 3, 'Impacto emocional', 'El abandono genera estrés, miedo y desconfianza, lo que puede afectar su comportamiento y dificultar su adaptación a un nuevo hogar.', NULL, 'consecuencia-emocional', 'Un cachorro triste acostado en el suelo'),
  ('CONSECUENCIAS', 4, 'Sobrepoblación animal', 'Aumenta el número de animales en situación de calle, lo que genera mayor presión en refugios y recursos limitados para su cuidado.', NULL, 'consecuencia-sobrepoblacion', 'Varios perros juntos en la calle'),
  ('CONSECUENCIAS', 5, 'Impacto en la comunidad', 'Puede generar problemas de salud pública, accidentes y afectaciones en el entorno, además de un mayor gasto en rescate y control.', NULL, 'consecuencia-comunidad', 'Un hombre agachado acercándose a un perro'),
  ('ACCIONES', 1, 'Adopta responsablemente', 'Evalúa tus posibilidades y comprométete a largo plazo.', NULL, 'accion-adopta', 'Una joven abrazando a su perro'),
  ('ACCIONES', 2, 'Esteriliza', 'Ayuda a prevenir la sobrepoblación animal.', NULL, 'accion-esteriliza', 'Un gato y un perro juntos'),
  ('ACCIONES', 3, 'Educa y comparte', 'Difunde la importancia de la tenencia responsable.', NULL, 'accion-educa', 'Un niño acostado junto a un gato')
ON CONFLICT (seccion, orden) DO UPDATE
  SET titulo = EXCLUDED.titulo,
      texto = EXCLUDED.texto,
      destacado = EXCLUDED.destacado,
      imagen = EXCLUDED.imagen,
      alt = EXCLUDED.alt;
