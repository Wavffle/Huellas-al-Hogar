import { useEffect, useRef, useState } from 'react';
import { IonIcon } from '@ionic/react';
import { arrowBack, arrowForward, paw } from 'ionicons/icons';
import PublishHero from '../components/publish/PublishHero';
import PublishSteps from '../components/publish/PublishSteps';
import PublishTrust from '../components/publish/PublishTrust';
import { PUBLISH_STEPS } from '../components/data/publish';
import { useMotionOff } from '../utils/useMotionOff';
import './PublishAnimalPage.css';

export default function PublishAnimalPage() {
    const motionOff = useMotionOff();
    const [step, setStep] = useState(1);
    const wizardRef = useRef<HTMLElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const previousStep = useRef(step);

    const total = PUBLISH_STEPS.length;
    const meta = PUBLISH_STEPS[step - 1];

    // Al cambiar de paso: enfoca el título y, si el formulario quedó arriba, sube hasta él
    useEffect(() => {
        if (previousStep.current === step) return;
        previousStep.current = step;

        titleRef.current?.focus({ preventScroll: true });

        const wizard = wizardRef.current;
        const content = wizard?.closest('ion-content');
        if (!wizard || !content) return;

        let cancelled = false;
        content.getScrollElement().then((scrollEl) => {
            if (cancelled) return;
            const navbar = document.querySelector<HTMLElement>('.navbar')?.offsetHeight ?? 0;
            const delta = wizard.getBoundingClientRect().top - scrollEl.getBoundingClientRect().top - navbar - 16;
            if (delta < 0) content.scrollToPoint(0, scrollEl.scrollTop + delta, motionOff ? 0 : 350);
        });
        return () => {
            cancelled = true;
        };
    }, [step, motionOff]);

    const goBack = () => setStep((s) => Math.max(1, s - 1));
    const goNext = () => setStep((s) => Math.min(total, s + 1));

    return (
        <div className="pub-page">
            <PublishHero />

            <section className="pub-wizard" ref={wizardRef} aria-label="Formulario para publicar un animal">
                <PublishSteps current={step} onSelect={setStep} />

                <div className="pub-panel">
                    <div className="pub-panel__inner" key={step}>
                        <header className="pub-panel__head">
                            <h2 ref={titleRef} tabIndex={-1} className="pub-panel__title">
                                {meta.title}
                            </h2>
                            <p className="pub-panel__subtitle selectable">{meta.subtitle}</p>
                        </header>

                        {/* Los campos de cada paso llegan en el siguiente bloque */}
                        <div className="pub-step">
                            <p className="pub-placeholder">
                                Paso {step} de {total}: aquí irán los campos.
                            </p>
                        </div>

                        <div className={`pub-nav${step === 1 ? ' pub-nav--single' : ''}`}>
                            {step > 1 && (
                                <button type="button" className="pub-btn pub-btn--outline" onClick={goBack}>
                                    <IonIcon icon={arrowBack} aria-hidden="true" />
                                    Volver
                                </button>
                            )}
                            {step < total ? (
                                <button type="button" className="pub-btn" onClick={goNext}>
                                    Siguiente
                                    <IonIcon icon={arrowForward} aria-hidden="true" />
                                </button>
                            ) : (
                                // Se conecta al envío en el bloque de la revisión
                                <button type="button" className="pub-btn" disabled>
                                    Publicar
                                    <IonIcon icon={paw} aria-hidden="true" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <PublishTrust />
        </div>
    );
}
