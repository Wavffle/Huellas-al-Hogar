import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { IonContent, IonPage } from '@ionic/react';
import type { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import './PublicLayout.css';

export default function PublicLayout({ children }: { children: ReactNode }) {
    const contentRef = useRef<HTMLIonContentElement>(null);
    const [scrolled, setScrolled] = useState(false);
    const { pathname } = useLocation();

    const scrollToTop = () => {
        contentRef.current?.scrollToTop(700); // duración en ms
    };

    useEffect(() => {
        contentRef.current?.scrollToTop(0);
    }, [pathname]);

    return (
        <IonPage>
            <IonContent
                ref={contentRef}
                fullscreen
                scrollEvents
                onIonScroll={(e) => setScrolled(e.detail.scrollTop > 10)}
            >
                <div className="public-layout">
                    <Navbar scrolled={scrolled} onLogoClick={scrollToTop} />
                    <main className="public-layout__main">{children}</main>
                    <Footer />
                </div>
            </IonContent>
        </IonPage>
    );
}