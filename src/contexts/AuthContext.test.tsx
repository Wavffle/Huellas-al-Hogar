import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FORBIDDEN_EVENT, SESSION_EXPIRED_EVENT, TOKEN_KEY, USER_KEY } from '../services/apiClient';
import { renovarSesion, type ApiUser } from '../services/authService';
import { AuthProvider, useAuth, type UserRole } from './AuthContext';

vi.mock('../services/authService', () => ({ renovarSesion: vi.fn() }));
const renovar = vi.mocked(renovarSesion);

const base64Url = (objeto: object) =>
    btoa(JSON.stringify(objeto)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

/** Un JWT con la forma real (cabecera.carga.firma); solo importa el vencimiento (exp). */
const crearToken = (segundosParaVencer: number) =>
    `${base64Url({ alg: 'HS256', typ: 'JWT' })}.${base64Url({
        sub: '7',
        exp: Math.floor(Date.now() / 1000) + segundosParaVencer,
    })}.firma`;

const usuarioApi = (rol: ApiUser['rol']): ApiUser => ({ id: 7, nombre: 'Ana', correo: 'ana@huellas.test', rol });
const sesionApi = (rol: ApiUser['rol']) => ({ token: crearToken(3600), usuario: usuarioApi(rol) });

function guardarSesion(role: UserRole = 'rescatista', segundosParaVencer = 3600) {
    localStorage.setItem(TOKEN_KEY, crearToken(segundosParaVencer));
    localStorage.setItem(USER_KEY, JSON.stringify({ id: 7, name: 'Ana', email: 'ana@huellas.test', role }));
}

const envoltorio = ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>;
/** Monta el proveedor y espera a que termine la renovación que hace al abrir la app. */
const montar = async () => {
    const montado = renderHook(() => useAuth(), { wrapper: envoltorio });
    await act(async () => {});
    return montado;
};

beforeEach(() => {
    localStorage.clear();
    renovar.mockReset();
    renovar.mockResolvedValue(sesionApi('RESCATISTA'));
});

describe('AuthContext: sesión guardada', () => {
    it('sin sesión guardada no hay usuario y no se pide renovar', async () => {
        const { result } = await montar();

        expect(result.current.user).toBeNull();
        expect(result.current.expired).toBe(false);
        expect(renovar).not.toHaveBeenCalled();
    });

    it('recupera la sesión guardada y renueva para obtener el rol vigente', async () => {
        guardarSesion('rescatista');
        renovar.mockResolvedValue(sesionApi('ADOPTANTE')); // un administrador le quitó el rol

        const { result } = renderHook(() => useAuth(), { wrapper: envoltorio });
        expect(result.current.user?.role).toBe('rescatista'); // al abrir se muestra lo guardado

        await waitFor(() => expect(result.current.user?.role).toBe('adoptante')); // y luego el rol vigente
        expect(renovar).toHaveBeenCalledTimes(1);
        expect(JSON.parse(localStorage.getItem(USER_KEY)!).role).toBe('adoptante');
    });

    it('descarta una sesión cuyo token ya venció', async () => {
        guardarSesion('administrador', -60);

        const { result } = await montar();

        expect(result.current.user).toBeNull();
        expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
        expect(renovar).not.toHaveBeenCalled();
    });

    it('descarta una sesión guardada sin id (versión anterior de la app)', async () => {
        localStorage.setItem(TOKEN_KEY, crearToken(3600));
        localStorage.setItem(USER_KEY, JSON.stringify({ name: 'Ana', role: 'adoptante' }));

        const { result } = await montar();

        expect(result.current.user).toBeNull();
        expect(localStorage.getItem(USER_KEY)).toBeNull();
    });
});

describe('AuthContext: login y logout', () => {
    it.each([
        ['ADOPTANTE', 'adoptante'],
        ['RESCATISTA', 'rescatista'],
        ['ADMIN', 'administrador'],
    ] as const)('login traduce el rol %s a %s y guarda la sesión', async (rolApi, rolApp) => {
        const { result } = await montar();
        const sesion = sesionApi(rolApi);

        act(() => result.current.login(sesion));

        expect(result.current.user).toEqual({ id: 7, name: 'Ana', email: 'ana@huellas.test', role: rolApp });
        expect(localStorage.getItem(TOKEN_KEY)).toBe(sesion.token);
        expect(JSON.parse(localStorage.getItem(USER_KEY)!).role).toBe(rolApp);
    });

    it('logout borra el usuario y la sesión guardada', async () => {
        guardarSesion();
        const { result } = await montar();

        act(() => result.current.logout());

        expect(result.current.user).toBeNull();
        expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
        expect(localStorage.getItem(USER_KEY)).toBeNull();
    });
});

describe('AuthContext: renovar la sesión', () => {
    it('si el servidor responde 401 (la cuenta ya no existe), cierra la sesión', async () => {
        guardarSesion();
        renovar.mockRejectedValue({ response: { status: 401 } });

        const { result } = await montar();

        await waitFor(() => expect(result.current.user).toBeNull());
        expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    });

    it('si no hay red, mantiene la sesión', async () => {
        guardarSesion();
        renovar.mockRejectedValue(new Error('Network Error'));

        const { result } = await montar();
        await waitFor(() => expect(renovar).toHaveBeenCalledTimes(1));

        expect(result.current.user?.role).toBe('rescatista');
        expect(localStorage.getItem(TOKEN_KEY)).not.toBeNull();
    });

    it('renew(minRemainingMs) solo renueva si al token le queda menos que ese tiempo', async () => {
        guardarSesion('rescatista', 3600); // le queda 1 hora
        const { result } = await montar();
        await waitFor(() => expect(renovar).toHaveBeenCalledTimes(1));

        await act(() => result.current.renew(60_000)); // exige 1 minuto: le sobra tiempo
        expect(renovar).toHaveBeenCalledTimes(1);

        await act(() => result.current.renew(2 * 3600_000)); // exige 2 horas: ya conviene renovar
        expect(renovar).toHaveBeenCalledTimes(2);
    });
});

describe('AuthContext: eventos del apiClient', () => {
    it('cuando el servidor rechaza el token, cierra la sesión y marca "expirada"', async () => {
        guardarSesion();
        const { result } = await montar();

        act(() => {
            window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
        });

        expect(result.current.user).toBeNull();
        expect(result.current.expired).toBe(true);
    });

    it('un nuevo login quita la marca de "expirada"', async () => {
        guardarSesion();
        const { result } = await montar();
        act(() => {
            window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
        });

        act(() => result.current.login(sesionApi('ADOPTANTE')));

        expect(result.current.expired).toBe(false);
        expect(result.current.user?.role).toBe('adoptante');
    });

    it('un 403 renueva la sesión para actualizar el rol, como máximo cada 10 segundos', async () => {
        guardarSesion('rescatista');
        const { result } = await montar();
        await waitFor(() => expect(renovar).toHaveBeenCalledTimes(1)); // la renovación al abrir la app
        renovar.mockResolvedValue(sesionApi('ADOPTANTE'));

        act(() => {
            window.dispatchEvent(new Event(FORBIDDEN_EVENT));
        });
        await waitFor(() => expect(result.current.user?.role).toBe('adoptante'));
        expect(renovar).toHaveBeenCalledTimes(2);

        act(() => {
            window.dispatchEvent(new Event(FORBIDDEN_EVENT)); // otro 403 enseguida: se ignora
        });
        expect(renovar).toHaveBeenCalledTimes(2);
    });

    it('si otra pestaña cierra la sesión, esta también se cierra', async () => {
        guardarSesion();
        const { result } = await montar();
        await waitFor(() => expect(renovar).toHaveBeenCalledTimes(1));

        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        act(() => {
            window.dispatchEvent(new StorageEvent('storage', { key: TOKEN_KEY }));
        });

        expect(result.current.user).toBeNull();
    });

    it('un cambio en otra clave del localStorage no afecta la sesión', async () => {
        guardarSesion();
        const { result } = await montar();
        await waitFor(() => expect(renovar).toHaveBeenCalledTimes(1));
        localStorage.removeItem(TOKEN_KEY); // el token desaparece, pero el evento es de otra clave

        act(() => {
            window.dispatchEvent(new StorageEvent('storage', { key: 'otra-clave' }));
        });

        expect(result.current.user).not.toBeNull();
    });
});

describe('useAuth', () => {
    it('lanza un error si se usa fuera de AuthProvider', () => {
        const consola = vi.spyOn(console, 'error').mockImplementation(() => {});

        expect(() => renderHook(() => useAuth())).toThrow('useAuth debe utilizarse dentro de AuthProvider');

        consola.mockRestore();
    });
});
