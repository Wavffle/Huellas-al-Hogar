import { IonContent, IonPage } from '@ionic/react';
import type { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import './PublicLayout.css';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
      <IonPage>
        <IonContent fullscreen>
          <div className="public-layout">
            <Navbar />
            <main className="public-layout__main">{children}</main>
            <Footer />
          </div>
        </IonContent>
      </IonPage>
  );
}