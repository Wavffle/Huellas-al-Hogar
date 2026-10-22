import { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import type { FormEvent } from 'react';
import { IonIcon } from '@ionic/react';
import { arrowBack, arrowForward, paw } from 'ionicons/icons';
import PublishHero from '../components/publish/PublishHero';
import PublishSteps from '../components/publish/PublishSteps';
import PublishTrust from '../components/publish/PublishTrust';
import PublishSuccess from '../components/publish/PublishSuccess';
import StepBasic from '../components/publish/StepBasic';
import StepFeatures from '../components/publish/StepFeatures';
import StepHealth from '../components/publish/StepHealth';
import StepPhotos from '../components/publish/StepPhotos';
import StepReview from '../components/publish/StepReview';
import { STEP_KEYS, validate, type Errors, type Key } from '../components/publish/publishForm';
import { INITIAL_PUBLISH_VALUES, PUBLISH_STEPS, type PublishValues } from '../data/publish';
import { useMotionOff } from '../utils/useMotionOff';
import './PublishAnimalPage.css';

/** Provisional: reemplazar por el id del usuario cuando el login real lo entregue. */
const USUARIO_ID_PRUEBA = 1;

export default function PublishAnimalPage() {
    const history = useHistory();
    const motionOff = useMotionOff();
    const [step, setStep] = useState(1);
    const [values, setValues] = useState<PublishValues>(INITIAL_PUBLISH_VALUES);
    const [errors, setErrors] = useState<Errors>({});
    const [sending, setSending] = useState(false);
    const [sendError, setSendError] = useState('');
    const [done, setDone] = useState(false);
    const [publishedName, setPublishedName] = useState('');
    const pageRef = useRef<HTMLDivElement>(null);
    const wizardRef = useRef<HTMLElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const previousStep = useRef(step);

    const total = PUBLISH_STEPS.length;
    const meta = PUBLISH_STEPS[step - 1];

    // Libera las vistas previas de las fotos al salir de la página
    const photosRef = useRef(values.fotos);
    photosRef.current = values.fotos;
    useEffect(
        () => () => {
            photosRef.current.forEach((photo: any) => {
                if (photo.url) URL.revokeObjectURL(photo.url);
            });
        },
        [],
    );

    // Al cambiar de paso: enfoca el título y sube la vista
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

    // Al terminar: sube al inicio para mostrar la pantalla de éxito
    useEffect(() => {
        if (done) pageRef.current?.closest('ion-content')?.scrollToTop(0);
    }, [done]);

    const set = <K extends Key>(key: K, value: PublishValues[K]) => {
        setValues((v) => ({ ...v, [key]: value }));
        setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
    };

    const changeStep = (next: number) => {
        setErrors({});
        setSendError('');
        setStep(next);
    };

    const focusFirstError = () =>
        requestAnimationFrame(() =>
            wizardRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
        );

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (sending) return;

        const stepErrors = validate(values, STEP_KEYS[step - 1]);
        setErrors(stepErrors);
        if (Object.keys(stepErrors).length > 0) {
            focusFirstError();
            return;
        }
        if (step < total) {
            changeStep(step + 1);
            return;
        }

        const all = validate(values, STEP_KEYS.flat());
        const firstBad = STEP_KEYS.findIndex((keys) => keys.some((k) => all[k]));
        if (firstBad !== -1) {
            setErrors(all);
            setStep(firstBad + 1);
            focusFirstError();
            return;
        }

        setSending(true);
        setSendError('');

        // FUSIÓN: Tu lógica de FormData conectada al diseño de validación de tu compa
        try {
            const data = new FormData();
            
            Object.entries(values).forEach(([key, value]) => {
                if (key !== 'fotos' && value !== '' && value !== null && value !== undefined) {
                    data.append(key, String(value));
                }
            });

            data.append('usuario_id', String(USUARIO_ID_PRUEBA));

            // Extraemos los archivos reales de las fotos para Multer
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            values.fotos.forEach((foto: any) => {
                if (foto.file) {
                    data.append('fotos', foto.file);
                } else {
                    data.append('fotos', foto);
                }
            });

            const response = await fetch('http://localhost:3000/api/animales', {
                method: 'POST',
                body: data,
            });

            const result = await response.json();

            if (result.success) {
                setPublishedName(values.nombre.trim());
                setDone(true); // Esto activa el componente <PublishSuccess />
            } else {
                setSendError('Error: ' + result.error?.message);
            }
        } catch (error) {
            console.error('Fallo al publicar:', error);
            setSendError('No se pudo publicar el animal. Intenta de nuevo.');
        } finally {
            setSending(false);
        }
    };

    // Usamos history para llevarte al catálogo una vez que termines de ver la pantalla de éxito
    const finishAndRedirect = () => {
        history.push('/adopciones');
    };

    const stepProps = { values, errors, set };

    return (
        <div className="pub-page" ref={pageRef}>
            <PublishHero />

            {done ? (
                // Pantalla final del compa con tu redirección inyectada
                <PublishSuccess name={publishedName} onAnother={finishAndRedirect} />
            ) : (
                <section className="pub-wizard" ref={wizardRef} aria-label="Formulario para publicar un animal">
                    <PublishSteps current={step} onSelect={changeStep} />

                    <div className="pub-panel">
                        <div className="pub-panel__inner" key={step}>
                            <header className="pub-panel__head">
                                <h2 ref={titleRef} tabIndex={-1} className="pub-panel__title">
                                    {meta.title}
                                </h2>
                                <p className="pub-panel__subtitle selectable">{meta.subtitle}</p>
                            </header>

                            <form className="pub-form" noValidate onSubmit={handleSubmit}>
                                <div className="pub-step">
                                    {step === 1 && <StepBasic {...stepProps} />}
                                    {step === 2 && <StepFeatures {...stepProps} />}
                                    {step === 3 && <StepHealth {...stepProps} />}
                                    {step === 4 && <StepPhotos {...stepProps} />}
                                    {step === 5 && <StepReview {...stepProps} />}
                                </div>

                                {sendError && (
                                    <p className="form-error pub-send-error" role="alert">
                                        {sendError}
                                    </p>
                                )}

                                <div className={`pub-nav${step === 1 ? ' pub-nav--single' : ''}`}>
                                    {step > 1 && (
                                        <button
                                            type="button"
                                            className="pub-btn pub-btn--outline"
                                            disabled={sending}
                                            onClick={() => changeStep(step - 1)}
                                        >
                                            <IonIcon icon={arrowBack} aria-hidden="true" />
                                            Volver
                                        </button>
                                    )}
                                    {step < total ? (
                                        <button type="submit" className="pub-btn">
                                            Siguiente
                                            <IonIcon icon={arrowForward} aria-hidden="true" />
                                        </button>
                                    ) : (
                                        <button type="submit" className="pub-btn" disabled={sending}>
                                            {sending ? 'Publicando…' : 'Publicar'}
                                            <IonIcon icon={paw} aria-hidden="true" />
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </section>
            )}

            <PublishTrust />
        </div>
    );
}
