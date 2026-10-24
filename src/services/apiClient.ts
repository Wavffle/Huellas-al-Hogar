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

const apiClient = axios.create({
    baseURL: 'http://localhost:3000/api', // URL base del backend express
    headers: {
        'Content-Type': 'application/json',
    },
});

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