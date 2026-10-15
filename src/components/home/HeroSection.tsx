import { IonButton, IonIcon } from '@ionic/react';
import { arrowForward } from 'ionicons/icons';
import heroArt from '../../assets/images/hero/header.webp';
import './HeroSection.css';

export default function HeroSection() {
    return (
        <section className="hero">
            <img src={heroArt} alt="" className="hero__art" />

            <div className="hero__content">
                <p className="hero__badge">Adopción responsable y bienestar animal</p>

                <h1 className="hero__title">
                    <svg className="hero__spark" viewBox="0 0 56 56" aria-hidden="true">
                        <path d="M22 4 L46 28" />
                        <path d="M3 42 L38 50" />
                    </svg>
                    <span className="hero__title-accent">Cada huella</span>
                    <span>Merece un hogar</span>
                </h1>

                <div className="hero__cta">
                    <p className="hero__text">
                        Conoce animales en adopción, aprende sobre tenencia responsable y ayuda a construir
                        segundas oportunidades.
                    </p>
                    <IonButton className="hero__button" routerLink="/adopciones">
                        Ver animales en adopción
                        <IonIcon slot="end" icon={arrowForward} />
                    </IonButton>
                </div>
            </div>
        </section>
    );
}