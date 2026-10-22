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
            'Puedes explorar los animales disponibles y revisar sus perfiles sin registrarte. Cuando encuentres uno que te interese, deberás completar una solicitud de adopción e iniciar sesión antes de enviarla. El rescatista revisará tu información y evaluará si el hogar es adecuado para el animal.',
        tag: 'Adopción',
        tagColor: 'primary',
    },
    {
        question: '¿Adoptar tiene algún costo?',
        answer: 'Huellas al Hogar no cobra por enviar una solicitud de adopción. Las condiciones particulares del proceso serán informadas por el rescatista responsable de cada animal antes de concretar la adopción.',
        tag: 'Adopción',
        tagColor: 'primary',
    },
    {
        question: '¿Cómo puedo publicar un animal?',
        answer:
            'Para publicar un animal debes crear una cuenta como rescatista. Desde la sección Publicar Animal podrás registrar sus características, estado de salud, fotografías y antecedentes relevantes antes de revisar y publicar su perfil.',
        tag: 'Rescatistas',
        tagColor: 'accent',
    },
    {
        question: '¿Qué significa tenencia responsable?',
        answer:
            'Significa asumir el compromiso de cuidar al animal durante toda su vida, entregándole alimentación, atención veterinaria, seguridad, ejercicio, afecto y un entorno adecuado. También implica prevenir su abandono y reproducción no planificada mediante prácticas responsables como la identificación y esterilización.',
        tag: 'Cuidados',
        tagColor: 'secondary',
    },
];