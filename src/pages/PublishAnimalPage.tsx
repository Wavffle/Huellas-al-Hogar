import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import { arrowBack, arrowForward, chevronBack, paw } from 'ionicons/icons';
import PawLoader from '../components/common/PawLoader';
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
import { animalToValues, buildFormData } from '../components/publish/publishMappers';
import { INITIAL_PUBLISH_VALUES, PUBLISH_STEPS, type FotoItem, type PublishValues } from '../data/publish';
import { createAnimal, getAnimalPorId, updateAnimal } from '../services/animalService';
import { useAuth } from '../contexts/AuthContext';
import { useMotionOff } from '../utils/useMotionOff';
import './PublishAnimalPage.css';

const HOUR = 60 * 60 * 1000;

type LoadState = 'loading' | 'ready' | 'notfound' | 'forbidden' | 'failed';

/**
 * Al editar, el servidor deja las fotos conservadas primero y las nuevas al final.
 * Si en el formulario quedaron en otro orden (por ejemplo, una nueva como portada),
 * se reordenan con una segunda llamada liviana.
 */
async function ordenarFotos(id: string, saved: { id: number }[] | undefined, wanted: FotoItem[]) {
    if (!saved) return;
    const existing = wanted.filter((f) => f.serverId !== undefined).length;
    const nuevas = saved.slice(existing).map((f) => f.id);
    let n = 0;
    const desired = wanted.map((f) => f.serverId ?? nuevas[n++]);
    if (desired.some((fotoId, i) => fotoId !== saved[i]?.id)) {
        await updateAnimal(id, { fotos_conservar: desired.join(',') });
    }
}

export default function PublishAnimalPage() {
    const { id } = useParams<{ id?: string }>();
    const editing = id !== undefined;
    const { user, renew } = useAuth();
    const motionOff = useMotionOff();
    const [step, setStep] = useState(1);
    const [values, setValues] = useState<PublishValues>(INITIAL_PUBLISH_VALUES);
    const [errors, setErrors] = useState<Errors>({});
    const [sending, setSending] = useState(false);
    const [sendError, setSendError] = useState('');
    const [done, setDone] = useState(false);
    const [publishedName, setPublishedName] = useState('');
    const [loadState, setLoadState] = useState<LoadState>(editing ? 'loading' : 'ready');
    const pageRef = useRef<HTMLDivElement>(null);
    const wizardRef = useRef<HTMLElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const previousStep = useRef(step);

    const total = PUBLISH_STEPS.length;
    const meta = PUBLISH_STEPS[step - 1];

    // Modo edición: carga el animal y rellena el formulario
    useEffect(() => {
        if (!editing || !id) return;
        let cancelled = false;
        setLoadState('loading');
        getAnimalPorId(id)
            .then((response) => {
                if (cancelled) return;
                const raw = response?.data ?? response;
                if (user?.role !== 'administrador' && Number(raw.usuario_id) !== user?.id) {
                    setLoadState('forbidden');
                    return;
                }
                setValues(animalToValues(raw));
                setLoadState('ready');
            })
            .catch((err) => {
                if (!cancelled) setLoadState(err?.response?.status === 404 ? 'notfound' : 'failed');
            });
        return () => {
            cancelled = true;
        };
    }, [id, editing, user?.id, user?.role]);

    // Mientras el formulario está abierto, mantiene fresco el token para no perder lo escrito
    useEffect(() => {
        const timer = window.setInterval(() => void renew(HOUR), 10 * 60 * 1000);
        return () => window.clearInterval(timer);
    }, [renew]);

    // Libera las vistas previas de las fotos al salir de la página
    const photosRef = useRef(values.fotos);
    photosRef.current = values.fotos;
    useEffect(
        () => () => {
            photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.url));
        },
        [],
    );

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

    // Al terminar: sube al inicio (PublishSuccess enfoca su propio título)
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

        // Último paso: revisa todo el formulario antes de enviar
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
        try {
            await renew(HOUR); // evita que el token venza justo al enviar
            if (editing && id) {
                const response = await updateAnimal(id, buildFormData(values, { edit: true }));
                await ordenarFotos(id, response?.data?.fotos, values.fotos);
            } else {
                await createAnimal(buildFormData(values));
            }
            setPublishedName(values.nombre.trim());
            setDone(true);
        } catch (err) {
            console.error('Fallo al guardar:', err);
            const res = (
                err as {
                    response?: { status?: number; data?: { error?: { message?: string; fields?: string[] } } };
                }
            )?.response;
            const detail = res?.data?.error;
            if (res?.status === 401) {
                setSendError(
                    'Tu sesión venció. Inicia sesión de nuevo en otra pestaña y vuelve a pulsar el botón: lo que escribiste se conserva.',
                );
            } else if (res?.status === 413) {
                setSendError('Una de las fotos pesa más de 5 MB.');
            } else {
                setSendError(
                    import.meta.env.DEV && detail?.message
                        ? `No se pudo guardar: ${detail.message}${detail.fields ? ` (${detail.fields.join(', ')})` : ''}`
                        : 'No se pudo guardar el animal. Intenta de nuevo.',
                );
            }
        } finally {
            setSending(false);
        }
    };

    const publishAnother = () => {
        values.fotos.forEach((photo) => URL.revokeObjectURL(photo.url));
        setValues(INITIAL_PUBLISH_VALUES);
        setErrors({});
        setSendError('');
        setStep(1);
        setDone(false);
    };

    if (editing && loadState !== 'ready') {
        return (
            <div className="pub-page" ref={pageRef}>
                <div className="pub-edit-msg">
                    {loadState === 'loading' ? (
                        <PawLoader label="Cargando publicación…" />
                    ) : (
                        <>
                            <p>
                                {loadState === 'notfound' && 'No encontramos esta publicación.'}
                                {loadState === 'forbidden' && 'Solo puedes editar tus propias publicaciones.'}
                                {loadState === 'failed' && 'No se pudo cargar la publicación.'}
                            </p>
                            <Link to="/panel" className="pub-btn">
                                Volver a mi panel
                            </Link>
                        </>
                    )}
                </div>
            </div>
        );
    }

    const stepProps = { values, errors, set };

    return (
        <div className="pub-page" ref={pageRef}>
            <PublishHero />

            {editing && !done && (
                <div className="pub-back-wrap">
                    <Link to="/panel" className="pub-back">
                        <IonIcon icon={chevronBack} aria-hidden="true" />
                        Volver a mi panel
                    </Link>
                </div>
            )}

            {done ? (
                <PublishSuccess
                    name={publishedName}
                    mode={editing ? 'edit' : 'create'}
                    animalId={id}
                    onAnother={publishAnother}
                />
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
                                            {sending
                                                ? editing
                                                    ? 'Guardando…'
                                                    : 'Publicando…'
                                                : editing
                                                    ? 'Guardar cambios'
                                                    : 'Publicar'}
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