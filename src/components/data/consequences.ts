import statAnimals from '../../assets/icons/stat-animales.svg';
import statAdoption from '../../assets/icons/stat-adopcion.svg';
import statSuffering from '../../assets/icons/stat-sufrimiento.svg';

import healthImage from '../../assets/images/consequences/consecuencia-salud.webp';
import risksImage from '../../assets/images/consequences/consecuencia-riesgos.webp';
import emotionalImage from '../../assets/images/consequences/consecuencia-emocional.webp';
import overpopulationImage from '../../assets/images/consequences/consecuencia-sobrepoblacion.webp';
import communityImage from '../../assets/images/consequences/consecuencia-comunidad.webp';

import adoptImage from '../../assets/images/consequences/accion-adopta.webp';
import sterilizeImage from '../../assets/images/consequences/accion-esteriliza.webp';
import educateImage from '../../assets/images/consequences/accion-educa.webp';

/* ===== Estadísticas ===== */
export interface Stat {
    icon: string;
    value: string;
    text: string;
}

export const stats: Stat[] = [
    {
        icon: statAnimals,
        value: '+ 100.000',
        text: 'animales se encuentran en situación de abandono en Chile cada año.',
    },
    {
        icon: statAdoption,
        value: 'Solo 1 de cada 10',
        text: 'animales en situación de calle logra ser adoptado.',
    },
    {
        icon: statSuffering,
        value: 'Miles',
        text: 'enfrentan hambre, enfermedades y peligros cada día.',
    },
];

export const statsSource =
    'Subdere (2022). Estimaciones sobre población de perros y gatos en situación de abandono en Chile';

/* ===== Principales consecuencias ===== */
export interface Consequence {
    tag: string;
    text: string;
    image: string;
    alt: string;
}

export const consequences: Consequence[] = [
    {
        tag: 'Problemas de salud',
        text: 'Los animales abandonados están expuestos a enfermedades, parásitos, desnutrición y falta de atención veterinaria.',
        image: healthImage,
        alt: 'Perros y gatos comiendo en el suelo de una calle',
    },
    {
        tag: 'Riesgos en su entorno',
        text: 'Enfrentan peligros como accidentes, maltrato, peleas con otros animales y condiciones climáticas extremas.',
        image: risksImage,
        alt: 'Cachorros refugiados entre objetos y basura',
    },
    {
        tag: 'Impacto emocional',
        text: 'El abandono genera estrés, miedo y desconfianza, lo que puede afectar su comportamiento y dificultar su adaptación a un nuevo hogar.',
        image: emotionalImage,
        alt: 'Un cachorro triste acostado en el suelo',
    },
    {
        tag: 'Sobrepoblación animal',
        text: 'Aumenta el número de animales en situación de calle, lo que genera mayor presión en refugios y recursos limitados para su cuidado.',
        image: overpopulationImage,
        alt: 'Varios perros juntos en la calle',
    },
    {
        tag: 'Impacto en la comunidad',
        text: 'Puede generar problemas de salud pública, accidentes y afectaciones en el entorno, además de un mayor gasto en rescate y control.',
        image: communityImage,
        alt: 'Un hombre agachado acercándose a un perro',
    },
];

/* ===== ¿Qué podemos hacer? =====
   position = punto de la ilustración que se mantiene visible al recortar (object-position) */
export interface Action {
    title: string;
    text: string;
    image: string;
    alt: string;
    position: string;
}

export const actions: Action[] = [
    {
        title: 'Adopta responsablemente',
        text: 'Evalúa tus posibilidades y comprométete a largo plazo.',
        image: adoptImage,
        alt: 'Una joven abrazando a su perro',
        position: 'center bottom',
    },
    {
        title: 'Esteriliza',
        text: 'Ayuda a prevenir la sobrepoblación animal.',
        image: sterilizeImage,
        alt: 'Un gato y un perro juntos',
        position: 'center 30%',
    },
    {
        title: 'Educa y comparte',
        text: 'Difunde la importancia de la tenencia responsable.',
        image: educateImage,
        alt: 'Un niño acostado junto a un gato',
        position: 'center 40%',
    },
];
