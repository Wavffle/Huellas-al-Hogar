import axios from 'axios';

/** Claves del localStorage. AuthContext usa las mismas. */
export const TOKEN_KEY = 'token';
export const USER_KEY = 'huellas-user';
/** Evento que avisa a AuthContext que el servidor rechazó el token. */
export const SESSION_EXPIRED_EVENT = 'huellas:session-expired';

export function clearStoredSession() {
    try {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    } catch {
        /* sin almacenamiento */
    }
}

/** Origen del backend. En producción se define con VITE_API_URL en el .env del frontend. */
export const API_ORIGIN: string = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

const apiClient = axios.create({
    baseURL: `${API_ORIGIN}/api`,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

/** Un solo lugar para convertir cualquier error de Axios en estado HTTP y mensaje para el usuario. */
export function apiError(err: unknown): { status?: number; message: string; fields?: string[] } {
    const e = err as {
        code?: string;
        response?: { status?: number; data?: { error?: { message?: string; fields?: string[] }; message?: string } };
    };
    if (!e?.response) {
        return {
            message:
                e?.code === 'ECONNABORTED'
                    ? 'El servidor tardó demasiado en responder. Intenta de nuevo.'
                    : 'No se pudo conectar con el servidor. Intenta de nuevo.',
        };
    }
    const { status, data } = e.response;
    return {
        status,
        message: data?.error?.message ?? data?.message ?? 'Ocurrió un error. Intenta de nuevo.',
        fields: data?.error?.fields,
    };
}

// Inyecta automáticamente el token JWT si existe
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// Token vencido o inválido: cierra la sesión. Un 401 en login/registro solo significa
// "credenciales incorrectas", no una sesión vencida.
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const url = String(error?.config?.url ?? '');
        if (error?.response?.status === 401 && !url.startsWith('/auth/')) {
            clearStoredSession();
            window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
        }
        return Promise.reject(error);
    },
);

export default apiClient;