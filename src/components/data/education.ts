import foodImage from '../../assets/images/education/cuidado-alimentacion.webp';
import healthImage from '../../assets/images/education/cuidado-salud.webp';
import sterilizationImage from '../../assets/images/education/cuidado-esterilizacion.webp';
import spaceImage from '../../assets/images/education/cuidado-espacio.webp';
import coexistenceImage from '../../assets/images/education/cuidado-convivencia.webp';

import iconTime from '../../assets/icons/pregunta-tiempo.svg';
import iconCosts from '../../assets/icons/pregunta-gastos.svg';
import iconHome from '../../assets/icons/pregunta-vivienda.svg';
import iconDifficulties from '../../assets/icons/pregunta-dificultades.svg';

export interface CareCard {
    title: string;
    text: string;
    image: string;
    alt: string;
    tone: 'dark' | 'purple';
}

export const careCards: CareCard[] = [
    {
        title: 'Alimentación e hidratación',
        text: 'Una alimentación adecuada y acceso permanente a agua limpia son parte fundamental del bienestar del animal. Sus necesidades pueden variar según su edad, tamaño y estado de salud.',
        image: foodImage,
        alt: 'Un corgi y un gatito comiendo del mismo plato',
        tone: 'dark',
    },
    {
        title: 'Salud y cuidados veterinarios',
        text: 'Los controles veterinarios permiten prevenir y detectar problemas de salud. Vacunación, desparasitación y atención oportuna forman parte del cuidado durante toda su vida.',
        image: healthImage,
        alt: 'Un cachorro y dos gatitos junto a un veterinario con estetoscopio',
        tone: 'purple',
    },
    {
        title: 'Esterilización e identificación',
        text: 'La esterilización contribuye al control de la reproducción no planificada. Mantener al animal correctamente identificado también facilita su regreso al hogar en caso de pérdida.',
        image: sterilizationImage,
        alt: 'Un gato con collar isabelino siendo atendido',
        tone: 'dark',
    },
    {
        title: 'Espacio, ejercicio y enriquecimiento',
        text: 'Perros y gatos necesitan espacios seguros, actividad física y oportunidades para jugar, explorar y expresar sus comportamientos naturales.',
        image: spaceImage,
        alt: 'Una mujer haciendo yoga junto a su perro',
        tone: 'purple',
    },
    {
        title: 'Convivencia responsable',
        text: 'Antes de adoptar es importante considerar el tiempo disponible, las características del hogar y las necesidades del animal. La decisión debe involucrar a quienes convivirán con él.',
        image: coexistenceImage,
        alt: 'Un perro y un gato frente a frente en el pasto',
        tone: 'dark',
    },
];

export interface AdoptionQuestion {
    icon: string;
    before: string;
    strong: string;
    after: string;
}

export const adoptionQuestions: AdoptionQuestion[] = [
    { icon: iconTime, before: '¿Tengo tiempo para cuidarlo ', strong: 'todos los días', after: '?' },
    { icon: iconCosts, before: '¿Puedo asumir sus gastos durante ', strong: 'toda su vida', after: '?' },
    { icon: iconHome, before: '¿Mi vivienda es ', strong: 'adecuada', after: ' para sus necesidades?' },
    {
        icon: iconDifficulties,
        before: '¿Estoy preparado para acompañarlo incluso cuando ',
        strong: 'aparezcan dificultades',
        after: '?',
    },
];

export const animalNeeds = ['Tiempo', 'Cuidado', 'Seguridad', 'Afecto', 'Un hogar estable'];
