import type { ReactNode } from 'react';
import PawLoader from './PawLoader';
import './ContentState.css';

interface Props {
    loading: boolean;
    error: string;
    onRetry: () => void;
    label?: string;
    children?: ReactNode;
}

/** Muestra el cargador o el error con "Reintentar"; cuando el contenido está listo, muestra `children`. */
export default function ContentState({ loading, error, onRetry, label = 'Cargando…', children }: Props) {
    if (loading) return <PawLoader label={label} />;

    if (error) {
        return (
            <div className="content-state" role="alert">
                <p>{error}</p>
                <button type="button" className="content-state__retry" onClick={onRetry}>
                    Reintentar
                </button>
            </div>
        );
    }

    return <>{children}</>;
}
