import { useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PublishAnimalPage from '../pages/PublishAnimalPage';
import RescuerRequirementsPage from '../pages/RescuerRequirementsPage';

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