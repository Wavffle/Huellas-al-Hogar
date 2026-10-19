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
      <Route path="/publicar" render={() => <PublicLayout><PublishGate /></PublicLayout>} exact />
      <Redirect exact from="/" to="/inicio" />
    </Switch>
  );
}