import apiClient from './apiClient';

// Pendiente en el backend: POST /api/solicitudes
export const createSolicitud = async (data: Record<string, unknown>) => {
    const response = await apiClient.post('/solicitudes', data);
    return response.data;
};