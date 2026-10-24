import apiClient from './apiClient';

/** Las dos categorías que existen en el sitio. */
export const CATEGORIAS = ['Tenencia responsable', 'Consecuencias del abandono'] as const;
export type Categoria = (typeof CATEGORIAS)[number];

export interface Contenido {
    id: number;
    titulo: string;
    categoria: string;
    contenido: string;
    creado_en: string;
}

export interface ContenidoInput {
    titulo: string;
    categoria: string;
    contenido: string;
}

export const getContenidos = async (categoria?: string): Promise<Contenido[]> => {
    const response = await apiClient.get('/contenidos-educativos', {
        params: categoria ? { categoria } : undefined,
    });
    return response.data.data;
};

export const crearContenido = async (data: ContenidoInput) => {
    const response = await apiClient.post('/contenidos-educativos', data);
    return response.data;
};

export const actualizarContenido = async (id: number, data: ContenidoInput) => {
    const response = await apiClient.patch(`/contenidos-educativos/${id}`, data);
    return response.data;
};

export const eliminarContenido = async (id: number) => {
    const response = await apiClient.delete(`/contenidos-educativos/${id}`);
    return response.data;
};