import apiClient from './apiClient';

export type EstadoAnimal = 'EN_ADOPCION' | 'EN_TRATAMIENTO' | 'ADOPTADO';

/** Lo que devuelve GET /api/animales/mios. */
export interface Publicacion {
    id: number;
    nombre: string;
    especie: string;
    estado: EstadoAnimal;
    imagen_portada: string | null;
    solicitudes_pendientes: number;
    creado_en: string;
    /** Solo viene con el nombre de quien publicó. */
    publicador_nombre?: string;
}

// para obtener la lista de animales
export const getAnimales = async () => {
    try {
        const response = await apiClient.get('/animales');
        return response.data;
    } catch (error) {
        console.error('Error al obtener los animales:', error);
        throw error;
    }
};

// para obtener un animal por id
export const getAnimalPorId = async (id: string) => {
    const response = await apiClient.get(`/animales/${id}`);
    return response.data;
};

/** Publicaciones del usuario con sesión. Un admin con `todos` recibe las de todos. */
export const getMisAnimales = async (todos = false): Promise<Publicacion[]> => {
    const response = await apiClient.get('/animales/mios', { params: todos ? { todos: true } : undefined });
    return response.data.data;
};

// crear un animal. Con fotos se envía FormData (multipart).
export const createAnimal = async (animalData: Record<string, unknown> | FormData) => {
    try {
        const response = await apiClient.post('/animales', animalData, {
            // Sin esto, el encabezado JSON por defecto de apiClient hace que axios convierta el FormData a JSON
            headers: animalData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
        });
        return response.data;
    } catch (error) {
        console.error('Error al crear el animal:', error);
        throw error;
    }
};

/** Edita un animal. FormData (con fotos) o JSON (por ejemplo, solo el estado). */
export const updateAnimal = async (id: string | number, data: Record<string, unknown> | FormData) => {
    const response = await apiClient.patch(`/animales/${id}`, data, {
        headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
    return response.data;
};

export const deleteAnimal = async (id: string | number) => {
    const response = await apiClient.delete(`/animales/${id}`);
    return response.data;
};