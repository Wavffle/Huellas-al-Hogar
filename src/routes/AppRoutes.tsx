import { Redirect, Route, Switch } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';
import ProtectedRoute from './ProtectedRoute';
import HomePage from '../pages/HomePage';
import AdoptionsPage from '../pages/AdoptionsPage';
import AdoptionDetailPage from '../pages/AdoptionDetailPage';
import EducationPage from '../pages/EducationPage';
import LoginPage from '../pages/LoginPage';
import ProfilePage from '../pages/ProfilePage';
import PublishGate from './PublishGate';
import AbandonmentConsequencesPage from '../pages/AbandonmentConsequencesPage';
import AdoptionRequestPage from '../pages/AdoptionRequestPage';
import MySolicitudesPage from '../pages/MySolicitudesPage';
import RescuerPanelPage from '../pages/RescuerPanelPage';
import PublishAnimalPage from '../pages/PublishAnimalPage';
import AdminPanelPage from '../pages/AdminPanelPage';
import NotFoundPage from '../pages/NotFoundPage';

export default function AppRoutes() {
  return (
    <Switch>
      <Route path={['/login', '/registro']} component={LoginPage} exact />
      <Route path="/inicio" render={() => <PublicLayout><HomePage /></PublicLayout>} exact />
      <Route path="/adopciones" render={() => <PublicLayout><AdoptionsPage /></PublicLayout>} exact />
      <Route path="/adopciones/:animalId" render={() => <PublicLayout><AdoptionDetailPage /></PublicLayout>} exact />
      <ProtectedRoute path="/adopciones/:animalId/solicitar" render={() => <PublicLayout><AdoptionRequestPage /></PublicLayout>} exact />
      <Route path="/educacion" render={() => <PublicLayout><EducationPage /></PublicLayout>} exact />
      <Route path="/educacion/consecuencias-abandono" render={() => <PublicLayout><AbandonmentConsequencesPage /></PublicLayout>} exact/>
      <ProtectedRoute path="/perfil" render={() => <PublicLayout><ProfilePage /></PublicLayout>} exact />
      <ProtectedRoute path="/mis-solicitudes" render={() => <PublicLayout><MySolicitudesPage /></PublicLayout>} exact />
      <Route path="/publicar" render={() => <PublicLayout><PublishGate /></PublicLayout>} exact />
      <ProtectedRoute path="/publicar/:id/editar" allowedRoles={['rescatista', 'administrador']} render={() => <PublicLayout><PublishAnimalPage /></PublicLayout>} exact />
      <ProtectedRoute path="/panel" allowedRoles={['rescatista', 'administrador']} render={() => <PublicLayout><RescuerPanelPage /></PublicLayout>} exact />
      <ProtectedRoute path="/admin" allowedRoles={['administrador']} render={() => <PublicLayout><AdminPanelPage /></PublicLayout>} exact />
      <Redirect exact from="/" to="/inicio" />
      <Route render={() => <PublicLayout><NotFoundPage /></PublicLayout>} />
    </Switch>
  );
}