import explora from '../assets/images/steps/explora-animales.webp';
import completa from '../assets/images/steps/completa-solicitud.webp';
import conoce from '../assets/images/steps/conoce-bienvenida.webp';

export interface HowItWorksStep {
    number: number;
    title: string;
    text: string;
    image: string;
    alt: string;
}

export const howItWorksSteps: HowItWorksStep[] = [
    {
        number: 1,
        title: 'Explora los animales',
        text: 'Revisa los perfiles de perros y gatos en adopción y encuentra a tu compañero ideal.',
        image: explora,
        alt: 'Ilustración de una pantalla con perfiles de perros y gatos',
    },
    {
        number: 2,
        title: 'Completa la solicitud',
        text: 'Inicia sesión y completa un breve formulario para postular a la adopción del animal que te interesa.',
        image: completa,
        alt: 'Ilustración de un formulario de adopción',
    },
    {
        number: 3,
        title: 'Conoce y da la bienvenida',
        text: 'Nos pondremos en contacto contigo para coordinar los siguientes pasos y que puedan conocerse.',
        image: conoce,
        alt: 'Ilustración de una persona abrazando a su nueva mascota',
    },
];