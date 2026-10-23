import apiClient from './apiClient';

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