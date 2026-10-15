export interface Faq {
    question: string;
    answer: string;
    tag: string;
    tagColor: 'primary' | 'secondary' | 'accent';
}

export const faqs: Faq[] = [
    {
        question: '¿Qué necesito para adoptar un animal?',
        answer:
            'Ser mayor de edad, completar el formulario de adopción y comprometerte a brindarle alimentación, atención veterinaria y un hogar seguro.',
        tag: 'Adopción',
        tagColor: 'primary',
    },
    {
        question: '¿Adoptar tiene algún costo?',
        answer: 'Texto de ejemplo: aquí se explica si existe algún costo asociado a la adopción.',
        tag: 'Adopción',
        tagColor: 'primary',
    },
    {
        question: '¿Cómo puedo publicar un animal?',
        answer:
            'Texto de ejemplo: los rescatistas inician sesión y completan el formulario de publicación con los datos y fotos del animal.',
        tag: 'Rescatistas',
        tagColor: 'accent',
    },
    {
        question: '¿Qué significa tenencia responsable?',
        answer:
            'Es el compromiso de cuidar a un animal durante toda su vida: salud, alimentación, afecto, esterilización y no abandonarlo.',
        tag: 'Cuidados',
        tagColor: 'secondary',
    },
];