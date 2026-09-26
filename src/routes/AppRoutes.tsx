import { Redirect, Route, Switch } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout';
import ProtectedRoute from './ProtectedRoute';
import HomePage from '../pages/HomePage';
import AdoptionsPage from '../pages/AdoptionsPage';
import AdoptionDetailPage from '../pages/AdoptionDetailPage';
import EducationPage from '../pages/EducationPage';
import LoginPage from '../pages/LoginPage';
import ProfilePage from '../pages/ProfilePage';
import PublishAnimalPage from '../pages/PublishAnimalPage';

export default function AppRoutes() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} exact />
      <Route path="/inicio" render={() => <PublicLayout><HomePage /></PublicLayout>} exact />
      <Route path="/adopciones" render={() => <PublicLayout><AdoptionsPage /></PublicLayout>} exact />
      <Route path="/adopciones/:animalId" render={() => <PublicLayout><AdoptionDetailPage /></PublicLayout>} exact />
      <Route path="/educacion" render={() => <PublicLayout><EducationPage /></PublicLayout>} exact />
      <ProtectedRoute path="/perfil" render={() => <PublicLayout><ProfilePage /></PublicLayout>} exact />
      <ProtectedRoute path="/publicar" render={() => <PublicLayout><PublishAnimalPage /></PublicLayout>} allowedRoles={['rescatista', 'administrador']} exact />
      <Redirect exact from="/" to="/inicio" />
    </Switch>
  );
}