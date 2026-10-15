export interface PurposeStep {
    number: string;
    title: string;
    text: string;
}

export const purposeSteps: PurposeStep[] = [
    {
        number: '01',
        title: 'Encontrar',
        text: 'Conectamos animales en adopción con personas dispuestas a brindarles un hogar responsable.',
    },
    {
        number: '02',
        title: 'Cuidar',
        text: 'Entregamos información sobre cuidados, bienestar y tenencia responsable.',
    },
    {
        number: '03',
        title: 'Prevenir',
        text: 'Informamos sobre las consecuencias del abandono y la proliferación de animales callejeros.',
    },
];