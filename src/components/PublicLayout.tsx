import { IonButtons, IonContent, IonHeader, IonIcon, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { pawOutline } from 'ionicons/icons';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { ReactNode } from 'react';

export default function PublicLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start"><IonMenuButton /></IonButtons>
          <IonTitle>
            <Link to="/inicio" className="brand-link">
              <IonIcon icon={pawOutline} /> Huellas al Hogar
            </Link>
          </IonTitle>
          <nav className="desktop-nav" aria-label="Navegación principal">
            <Link to="/inicio">Inicio</Link>
            <Link to="/adopciones">Adopciones</Link>
            <Link to="/educacion">Tenencia responsable</Link>
            {user?.role !== 'adoptante' && <Link to="/publicar">Publicar animal</Link>}
            {user ? <button onClick={logout}>Cerrar sesión</button> : <Link to="/login">Iniciar sesión</Link>}
          </nav>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>{children}</IonContent>
    </IonPage>
  );
}