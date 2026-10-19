import { useAuth } from '../contexts/AuthContext';
import PublishAnimalPage from '../pages/PublishAnimalPage';
import RescuerRequirementsPage from '../pages/RescuerRequirementsPage';

/** Rescatistas y administradores ven el formulario; el resto, los requisitos. */
export default function PublishGate() {
    const { user } = useAuth();
    const canPublish = user?.role === 'rescatista' || user?.role === 'administrador';
    return canPublish ? <PublishAnimalPage /> : <RescuerRequirementsPage />;
}