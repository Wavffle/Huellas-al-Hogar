import apiClient from './apiClient';

/** Secciones de contenido que entrega la API (tipo seccion_contenido de la base de datos). */
export type SeccionContenido =
    | 'CUIDADOS'
    | 'PREGUNTAS'
    | 'NECESIDADES'
    | 'ESTADISTICAS'
    | 'FUENTE'
    | 'CONSECUENCIAS'
    | 'ACCIONES';

export interface Bloque {
    id: number;
    seccion: SeccionContenido;
    orden: number;
    titulo: string | null;
    texto: string;
    /** Fragmento de `texto` que se muestra en negrita (solo en PREGUNTAS). */
    destacado: string | null;
    /** Clave de la imagen o ícono del frontend (ver utils/contenido.ts). */
    imagen: string | null;
    alt: string | null;
}

/** Bloques de una sección, ya ordenados como deben mostrarse. */
export const getBloques = async (seccion: SeccionContenido): Promise<Bloque[]> => {
    const response = await apiClient.get('/bloques-contenido', { params: { seccion } });
    return response.data.data;
};
