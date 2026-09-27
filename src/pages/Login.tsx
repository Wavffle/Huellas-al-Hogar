import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/react';

const Login: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Iniciar Sesión</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <h2>Bienvenido a Huellas al Hogar</h2>
        {/* Este botón simula el ingreso cambiando de ruta */}
        <IonButton expand="block" routerLink="/home">Simular Ingreso</IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Login;
