import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getSolicitudesPendientes } from '../services/solicitudService';
import { SOLICITUDES_ACTUALIZADAS_EVENT } from './notificaciones';

const POLL_MS = 60_000;

/** Cantidad de solicitudes de adopción pendientes de revisar (0 si el usuario no es rescatista ni admin). */
export function usePendingRequests(): number {
    const { user } = useAuth();
    const enabled = user?.role === 'rescatista' || user?.role === 'administrador';
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!enabled) {
            setCount(0);
            return;
        }

        let cancelled = false;

        const refresh = async () => {
            try {
                const pending = await getSolicitudesPendientes();
                if (!cancelled) setCount(pending.length);
            } catch {
                /* sin red o sesión vencida: se mantiene el último valor */
            }
        };

        const onVisible = () => {
            if (document.visibilityState === 'visible') void refresh();
        };
        const onUpdated = () => void refresh();

        void refresh();
        const timer = window.setInterval(onVisible, POLL_MS);
        document.addEventListener('visibilitychange', onVisible);
        window.addEventListener(SOLICITUDES_ACTUALIZADAS_EVENT, onUpdated);

        return () => {
            cancelled = true;
            window.clearInterval(timer);
            document.removeEventListener('visibilitychange', onVisible);
            window.removeEventListener(SOLICITUDES_ACTUALIZADAS_EVENT, onUpdated);
        };
    }, [enabled, user?.id]);

    return count;
}