import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from '../contexts/AuthContext';
import { getSolicitudesPendientes } from '../services/solicitudService';
import { avisarSolicitudesActualizadas } from './notificaciones';
import { usePendingRequests } from './usePendingRequests';

vi.mock('../contexts/AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('../services/solicitudService', () => ({ getSolicitudesPendientes: vi.fn() }));

const authMock = vi.mocked(useAuth);
const pendientesMock = vi.mocked(getSolicitudesPendientes);

const comoRol = (role: string) => authMock.mockReturnValue({ user: { id: 7, role } } as never);
const pendientes = (n: number) => Array.from({ length: n }, (_, i) => ({ id: i + 1 })) as never;

beforeEach(() => {
    authMock.mockReset();
    pendientesMock.mockReset();
});

describe('usePendingRequests (RF-10)', () => {
    it('un rescatista ve la cantidad de solicitudes pendientes', async () => {
        comoRol('rescatista');
        pendientesMock.mockResolvedValue(pendientes(3));

        const { result } = renderHook(() => usePendingRequests());

        await waitFor(() => expect(result.current).toBe(3));
    });

    it('un administrador también las ve', async () => {
        comoRol('administrador');
        pendientesMock.mockResolvedValue(pendientes(2));

        const { result } = renderHook(() => usePendingRequests());

        await waitFor(() => expect(result.current).toBe(2));
    });

    it('un adoptante ve 0 y no se consulta el servidor', async () => {
        comoRol('adoptante');

        const { result } = renderHook(() => usePendingRequests());

        expect(result.current).toBe(0);
        expect(pendientesMock).not.toHaveBeenCalled();
    });

    it('sin sesión ve 0 y no se consulta el servidor', async () => {
        authMock.mockReturnValue({ user: null } as never);

        const { result } = renderHook(() => usePendingRequests());

        expect(result.current).toBe(0);
        expect(pendientesMock).not.toHaveBeenCalled();
    });

    it('se actualiza cuando el rescatista aprueba o rechaza una solicitud', async () => {
        comoRol('rescatista');
        pendientesMock.mockResolvedValueOnce(pendientes(3)).mockResolvedValueOnce(pendientes(2));

        const { result } = renderHook(() => usePendingRequests());
        await waitFor(() => expect(result.current).toBe(3));

        act(() => avisarSolicitudesActualizadas());

        await waitFor(() => expect(result.current).toBe(2));
    });

    it('si falla la red, mantiene el último valor', async () => {
        comoRol('rescatista');
        pendientesMock.mockResolvedValueOnce(pendientes(3)).mockRejectedValueOnce(new Error('Network Error'));

        const { result } = renderHook(() => usePendingRequests());
        await waitFor(() => expect(result.current).toBe(3));

        act(() => avisarSolicitudesActualizadas());

        await waitFor(() => expect(pendientesMock).toHaveBeenCalledTimes(2));
        expect(result.current).toBe(3);
    });
});