import { useCallback, useEffect, useState } from 'react';
import { apiError } from '../services/apiClient';
import { getBloques, type Bloque, type SeccionContenido } from '../services/bloquesService';

/** Carga los bloques de una sección desde la API, con estado de carga, error y reintento. */
export function useBloques(seccion: SeccionContenido) {
    const [items, setItems] = useState<Bloque[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [intento, setIntento] = useState(0);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError('');
        getBloques(seccion)
            .then((list) => !cancelled && setItems(list))
            .catch((err) => !cancelled && setError(apiError(err).message))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, [seccion, intento]);

    const reload = useCallback(() => setIntento((n) => n + 1), []);

    return { items, loading, error, reload };
}
