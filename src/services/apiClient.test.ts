import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import apiClient, {
    FORBIDDEN_EVENT,
    SESSION_EXPIRED_EVENT,
    TOKEN_KEY,
    USER_KEY,
    apiError,
    clearStoredSession,
} from './apiClient';

/** Reemplaza la red: el adaptador de Axios responde lo que pida cada prueba y guarda las peticiones. */
function simularServidor(status: number, data: unknown = {}) {
    const peticiones: InternalAxiosRequestConfig[] = [];
    apiClient.defaults.adapter = (config) => {
        peticiones.push(config);
        const respuesta: AxiosResponse = { data, status, statusText: '', headers: {}, config };
        if (status >= 400) {
            return Promise.reject(
                new AxiosError(`HTTP ${status}`, AxiosError.ERR_BAD_REQUEST, config, undefined, respuesta),
            );
        }
        return Promise.resolve(respuesta);
    };
    return peticiones;
}

const escuchadores: Array<() => void> = [];
/** Devuelve un espía que cuenta cuántas veces se disparó el evento. */
function escuchar(evento: string) {
    const espia = vi.fn();
    window.addEventListener(evento, espia);
    escuchadores.push(() => window.removeEventListener(evento, espia));
    return espia;
}

function guardarSesion() {
    localStorage.setItem(TOKEN_KEY, 'token-de-prueba');
    localStorage.setItem(USER_KEY, JSON.stringify({ id: 1, name: 'Ana', email: 'ana@huellas.test', role: 'rescatista' }));
}

beforeEach(() => {
    localStorage.clear();
});

afterEach(() => {
    escuchadores.splice(0).forEach((quitar) => quitar());
    vi.unstubAllEnvs();
    vi.resetModules();
});

describe('apiClient: encabezado Authorization', () => {
    it('envía el token guardado como Bearer', async () => {
        localStorage.setItem(TOKEN_KEY, 'abc123');
        const peticiones = simularServidor(200);

        await apiClient.get('/animales');

        expect(peticiones[0].headers.Authorization).toBe('Bearer abc123');
    });

    it('no envía Authorization si no hay sesión', async () => {
        const peticiones = simularServidor(200);

        await apiClient.get('/animales');

        expect(peticiones[0].headers.Authorization).toBeUndefined();
    });
});

describe('apiClient: respuestas de error', () => {
    it('un 401 en una ruta protegida cierra la sesión y avisa a AuthContext', async () => {
        guardarSesion();
        const sesionExpirada = escuchar(SESSION_EXPIRED_EVENT);
        simularServidor(401);

        await expect(apiClient.get('/animales/mios')).rejects.toMatchObject({ response: { status: 401 } });

        expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
        expect(localStorage.getItem(USER_KEY)).toBeNull();
        expect(sesionExpirada).toHaveBeenCalledTimes(1);
    });

    it('un 401 en /auth/ (credenciales incorrectas) no cierra la sesión ni avisa', async () => {
        guardarSesion();
        const sesionExpirada = escuchar(SESSION_EXPIRED_EVENT);
        simularServidor(401);

        await expect(apiClient.post('/auth/login', {})).rejects.toBeTruthy();

        expect(localStorage.getItem(TOKEN_KEY)).toBe('token-de-prueba');
        expect(sesionExpirada).not.toHaveBeenCalled();
    });

    it('un 403 avisa para renovar el rol, pero mantiene la sesión', async () => {
        guardarSesion();
        const prohibido = escuchar(FORBIDDEN_EVENT);
        const sesionExpirada = escuchar(SESSION_EXPIRED_EVENT);
        simularServidor(403);

        await expect(apiClient.post('/animales', {})).rejects.toMatchObject({ response: { status: 403 } });

        expect(prohibido).toHaveBeenCalledTimes(1);
        expect(sesionExpirada).not.toHaveBeenCalled();
        expect(localStorage.getItem(TOKEN_KEY)).toBe('token-de-prueba');
    });

    it.each([400, 404, 409, 500])('un %i no cierra la sesión ni dispara eventos', async (status) => {
        guardarSesion();
        const sesionExpirada = escuchar(SESSION_EXPIRED_EVENT);
        const prohibido = escuchar(FORBIDDEN_EVENT);
        simularServidor(status);

        await expect(apiClient.get('/animales/1')).rejects.toBeTruthy();

        expect(sesionExpirada).not.toHaveBeenCalled();
        expect(prohibido).not.toHaveBeenCalled();
        expect(localStorage.getItem(TOKEN_KEY)).toBe('token-de-prueba');
    });

    it('una respuesta correcta se entrega sin cambios', async () => {
        simularServidor(200, { success: true, data: [1, 2, 3] });

        const respuesta = await apiClient.get('/animales');

        expect(respuesta.data).toEqual({ success: true, data: [1, 2, 3] });
    });
});

describe('apiError', () => {
    const conRespuesta = (status: number, data: unknown) => ({ response: { status, data } });

    it('usa el mensaje y los campos inválidos que entrega el servidor', () => {
        const error = apiError(
            conRespuesta(400, { error: { message: 'Hay campos inválidos', fields: ['nombre', 'especie'] } }),
        );

        expect(error).toEqual({ status: 400, message: 'Hay campos inválidos', fields: ['nombre', 'especie'] });
    });

    it('usa data.message si no hay data.error.message', () => {
        expect(apiError(conRespuesta(500, { message: 'Falla interna' })).message).toBe('Falla interna');
    });

    it('usa un mensaje genérico si el servidor no explica el error', () => {
        expect(apiError(conRespuesta(500, {})).message).toBe('Ocurrió un error. Intenta de nuevo.');
    });

    it('avisa cuando el servidor tarda demasiado (timeout)', () => {
        expect(apiError({ code: 'ECONNABORTED' }).message).toBe(
            'El servidor tardó demasiado en responder. Intenta de nuevo.',
        );
    });

    it('avisa cuando no hay conexión con el servidor', () => {
        expect(apiError(new Error('Network Error')).message).toBe(
            'No se pudo conectar con el servidor. Intenta de nuevo.',
        );
        expect(apiError(undefined).message).toBe('No se pudo conectar con el servidor. Intenta de nuevo.');
    });
});

describe('clearStoredSession', () => {
    it('borra el token y el usuario guardados', () => {
        guardarSesion();

        clearStoredSession();

        expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
        expect(localStorage.getItem(USER_KEY)).toBeNull();
    });
});

describe('apiClient: VITE_API_URL', () => {
    it('usa VITE_API_URL como origen del backend, con el prefijo /api', async () => {
        vi.stubEnv('VITE_API_URL', 'https://api.huellas.cl');
        vi.resetModules();

        const modulo = await import('./apiClient');

        expect(modulo.API_ORIGIN).toBe('https://api.huellas.cl');
        expect(modulo.default.defaults.baseURL).toBe('https://api.huellas.cl/api');
    });

    it('sin VITE_API_URL usa http://localhost:3000', async () => {
        vi.stubEnv('VITE_API_URL', undefined as unknown as string);
        vi.resetModules();

        const modulo = await import('./apiClient');

        expect(modulo.API_ORIGIN).toBe('http://localhost:3000');
        expect(modulo.default.defaults.baseURL).toBe('http://localhost:3000/api');
    });
});
