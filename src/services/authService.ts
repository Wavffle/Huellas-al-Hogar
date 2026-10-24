import apiClient from './apiClient';

export type ApiRole = 'ADMIN' | 'RESCATISTA' | 'ADOPTANTE';

export interface ApiUser {
    id: number;
    nombre: string;
    correo: string;
    rol: ApiRole;
}

interface AuthResponse {
    success: boolean;
    message: string;
    data: { token: string; usuario: ApiUser };
}

/** Crea una cuenta de adoptante y devuelve el token y los datos del usuario. */
export const registrarUsuario = async (nombre: string, correo: string, password: string) => {
    const response = await apiClient.post<AuthResponse>('/auth/registro', { nombre, correo, password });
    return response.data.data;
};

export const iniciarSesion = async (correo: string, password: string, recordar = false) => {
    const response = await apiClient.post<AuthResponse>('/auth/login', { correo, password, recordar });
    return response.data.data;
};

/** Pide un token nuevo y el rol vigente. */
export const renovarSesion = async () => {
    const response = await apiClient.post<AuthResponse>('/auth/renovar');
    return response.data.data;
};

/** Mensaje del servidor ("Ya existe una cuenta con ese correo"…) o uno genérico si no hubo respuesta. */
export function authErrorMessage(err: unknown): string {
    const data = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data;
    return data?.error?.message ?? 'No se pudo conectar con el servidor. Intenta de nuevo.';
}