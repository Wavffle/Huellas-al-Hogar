import apiClient from './apiClient';
import type { ApiRole } from './authService';

export interface UsuarioAdmin {
    id: number;
    nombre: string;
    correo: string;
    rol: ApiRole;
    creado_en: string;
    publicaciones: number;
}

export const listarUsuarios = async (q = ''): Promise<UsuarioAdmin[]> => {
    const response = await apiClient.get('/usuarios', { params: q ? { q } : undefined });
    return response.data.data;
};

export const cambiarRol = async (id: number, rol: ApiRole) => {
    const response = await apiClient.patch(`/usuarios/${id}/rol`, { rol });
    return response.data;
};