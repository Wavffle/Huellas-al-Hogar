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

// crear un animal (ruta protegida por JWT en el backend)
export const createAnimal = async (animalData: any) => {
    try {
        const response = await apiClient.post('/animales', animalData);
        return response.data;
    } catch (error) {
        console.error('Error al crear el animal:', error);
        throw error;
    }
};
