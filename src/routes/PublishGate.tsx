import { lazy, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

// Se descargan solo cuando hacen falta (el formulario de publicar es una de las páginas más pesadas)
const PublishAnimalPage = lazy(() => import('../pages/PublishAnimalPage'));
const RescuerRequirementsPage = lazy(() => import('../pages/RescuerRequirementsPage'));

/** Rescatistas y administradores ven el formulario; el resto, los requisitos. */
export default function PublishGate() {
    const { user, expired } = useAuth();
    const wasPublisher = useRef(false);
    const canPublish = user?.role === 'rescatista' || user?.role === 'administrador';
    if (canPublish) wasPublisher.current = true;

    // Si la sesión venció mientras escribían, el formulario se queda en pantalla para no perder lo escrito
    const keepForm = !user && expired && wasPublisher.current;
    return canPublish || keepForm ? <PublishAnimalPage /> : <RescuerRequirementsPage />;
}