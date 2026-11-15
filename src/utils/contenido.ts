// La API entrega el texto; las imágenes viven en el frontend (las empaqueta Vite).
// Cada bloque trae una `imagen` con la clave del archivo y aquí se traduce a su ruta.

import cuidadoAlimentacion from '../assets/images/education/cuidado-alimentacion.webp';
import cuidadoSalud from '../assets/images/education/cuidado-salud.webp';
import cuidadoEsterilizacion from '../assets/images/education/cuidado-esterilizacion.webp';
import cuidadoEspacio from '../assets/images/education/cuidado-espacio.webp';
import cuidadoConvivencia from '../assets/images/education/cuidado-convivencia.webp';

import preguntaTiempo from '../assets/icons/pregunta-tiempo.svg';
import preguntaGastos from '../assets/icons/pregunta-gastos.svg';
import preguntaVivienda from '../assets/icons/pregunta-vivienda.svg';
import preguntaDificultades from '../assets/icons/pregunta-dificultades.svg';

import statAnimales from '../assets/icons/stat-animales.svg';
import statAdopcion from '../assets/icons/stat-adopcion.svg';
import statSufrimiento from '../assets/icons/stat-sufrimiento.svg';

import consecuenciaSalud from '../assets/images/consequences/consecuencia-salud.webp';
import consecuenciaRiesgos from '../assets/images/consequences/consecuencia-riesgos.webp';
import consecuenciaEmocional from '../assets/images/consequences/consecuencia-emocional.webp';
import consecuenciaSobrepoblacion from '../assets/images/consequences/consecuencia-sobrepoblacion.webp';
import consecuenciaComunidad from '../assets/images/consequences/consecuencia-comunidad.webp';

import accionAdopta from '../assets/images/consequences/accion-adopta.webp';
import accionEsteriliza from '../assets/images/consequences/accion-esteriliza.webp';
import accionEduca from '../assets/images/consequences/accion-educa.webp';

const IMAGENES: Record<string, string> = {
    'cuidado-alimentacion': cuidadoAlimentacion,
    'cuidado-salud': cuidadoSalud,
    'cuidado-esterilizacion': cuidadoEsterilizacion,
    'cuidado-espacio': cuidadoEspacio,
    'cuidado-convivencia': cuidadoConvivencia,
    'pregunta-tiempo': preguntaTiempo,
    'pregunta-gastos': preguntaGastos,
    'pregunta-vivienda': preguntaVivienda,
    'pregunta-dificultades': preguntaDificultades,
    'stat-animales': statAnimales,
    'stat-adopcion': statAdopcion,
    'stat-sufrimiento': statSufrimiento,
    'consecuencia-salud': consecuenciaSalud,
    'consecuencia-riesgos': consecuenciaRiesgos,
    'consecuencia-emocional': consecuenciaEmocional,
    'consecuencia-sobrepoblacion': consecuenciaSobrepoblacion,
    'consecuencia-comunidad': consecuenciaComunidad,
    'accion-adopta': accionAdopta,
    'accion-esteriliza': accionEsteriliza,
    'accion-educa': accionEduca,
};

/** Ruta de la imagen para la clave que entrega la API (cadena vacía si no existe). */
export function imagenContenido(clave: string | null): string {
    return (clave && IMAGENES[clave]) || '';
}

/** Parte un texto en lo que va antes, el fragmento destacado (negrita) y lo que va después. */
export function partirDestacado(texto: string, destacado: string | null) {
    const inicio = destacado ? texto.indexOf(destacado) : -1;
    if (!destacado || inicio < 0) return { antes: texto, destacado: '', despues: '' };
    return {
        antes: texto.slice(0, inicio),
        destacado,
        despues: texto.slice(inicio + destacado.length),
    };
}
