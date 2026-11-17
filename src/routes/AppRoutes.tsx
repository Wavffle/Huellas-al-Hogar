import { lazy, Suspense } from 'react';
import type { ElementType } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';
import ProtectedRoute from './ProtectedRoute';
import PublishGate from './PublishGate';
import HomePage from '../pages/HomePage';

// Las demás páginas se descargan solo cuando el usuario entra a ellas (carga diferida)
const LoginPage = lazy(() => import('../pages/LoginPage'));
const AdoptionsPage = lazy(() => import('../pages/AdoptionsPage'));
const AdoptionDetailPage = lazy(() => import('../pages/AdoptionDetailPage'));
const AdoptionRequestPage = lazy(() => import('../pages/AdoptionRequestPage'));
const EducationPage = lazy(() => import('../pages/EducationPage'));
const AbandonmentConsequencesPage = lazy(() => import('../pages/AbandonmentConsequencesPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const MySolicitudesPage = lazy(() => import('../pages/MySolicitudesPage'));
const PublishAnimalPage = lazy(() => import('../pages/PublishAnimalPage'));
const RescuerPanelPage = lazy(() => import('../pages/RescuerPanelPage'));
const AdminPanelPage = lazy(() => import('../pages/AdminPanelPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

// Aviso mientras se descarga la página
function CargandoPagina() {
    return (
        <div
            role="status"
            aria-live="polite"
            style={{ minHeight: '40vh', display: 'grid', placeItems: 'center' }}
        >
            Cargando…
        </div>
    );
}

// Muestra la página dentro del layout público; el aviso de carga queda dentro del layout
const conLayout = (Pagina: ElementType) => () => (
    <PublicLayout>
        <Suspense fallback={<CargandoPagina />}>
            <Pagina />
        </Suspense>
    </PublicLayout>
);

export default function AppRoutes() {
    return (
        <Switch>
            <Route
                path={['/login', '/registro']}
                render={() => (
                    <Suspense fallback={<CargandoPagina />}>
                        <LoginPage />
                    </Suspense>
                )}
                exact
            />
            <Route path="/inicio" render={conLayout(HomePage)} exact />
            <Route path="/adopciones" render={conLayout(AdoptionsPage)} exact />
            <Route path="/adopciones/:animalId" render={conLayout(AdoptionDetailPage)} exact />
            <ProtectedRoute path="/adopciones/:animalId/solicitar" render={conLayout(AdoptionRequestPage)} exact />
            <Route path="/educacion" render={conLayout(EducationPage)} exact />
            <Route path="/educacion/consecuencias-abandono" render={conLayout(AbandonmentConsequencesPage)} exact />
            <ProtectedRoute path="/perfil" render={conLayout(ProfilePage)} exact />
            <ProtectedRoute path="/mis-solicitudes" render={conLayout(MySolicitudesPage)} exact />
            <Route path="/publicar" render={conLayout(PublishGate)} exact />
            <ProtectedRoute path="/publicar/:id/editar" allowedRoles={['rescatista', 'administrador']} render={conLayout(PublishAnimalPage)} exact />
            <ProtectedRoute path="/panel" allowedRoles={['rescatista', 'administrador']} render={conLayout(RescuerPanelPage)} exact />
            <ProtectedRoute path="/admin" allowedRoles={['administrador']} render={conLayout(AdminPanelPage)} exact />
            <Redirect exact from="/" to="/inicio" />
            <Route render={conLayout(NotFoundPage)} />
        </Switch>
    );
}