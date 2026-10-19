import { useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import {
    arrowBack,
    arrowForward,
    calendarOutline,
    checkmark,
    checkmarkCircleOutline,
    chevronBack,
    chevronDown,
    heartOutline,
    homeOutline,
    locationOutline,
    paw,
    personOutline,
    shieldOutline,
    starOutline,
} from 'ionicons/icons';
import { useAuth } from '../contexts/AuthContext';
import { getAnimalPorId } from '../services/animalService';
import { createSolicitud } from '../services/solicitudService';
import { CIUDADES } from '../components/data/ciudades';
import PawLoader from '../components/common/PawLoader';
import AdoptionGallery from '../components/adoptions/AdoptionGallery';
import { capitalize, mapAnimalDetail, type AnimalDetail } from '../components/adoptions/adoptionDetail';
import { formatAge } from '../components/adoptions/adoptionUtils';
import iconRegla from '../assets/icons/detalle-regla.svg';
import iconSexo from '../assets/icons/detalle-sexo.svg';
import doodle from '../assets/images/solicitud/solicitud-garabato.svg';
import clouds from '../assets/images/solicitud/solicitud-nubes.svg';
import './AdoptionRequestPage.css';

/** true = simula el envío (el backend aún no tiene POST /api/solicitudes). */
const SIMULAR_ENVIO = true;

const VIVIENDAS = ['Casa', 'Departamento', 'Otro'];
const SI_NO = ['Sí', 'No'];
const STEP_LABELS = ['Información', 'Hogar', 'Experiencia', 'Compromiso'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Values = {
    nombre: string;
    correo: string;
    telefono: string;
    ciudad: string;
    vivienda: string;
    patio: string;
    convive: string;
    tuvoMascotas: string;
    tieneMascotas: string;
    experiencia: string;
    motivo: string;
    acepta: boolean;
};
type Key = keyof Values;
type Errors = Partial<Record<Key, string>>;

const STEP_KEYS: Key[][] = [
    ['nombre', 'correo', 'telefono', 'ciudad'],
    ['vivienda', 'patio', 'convive'],
    ['tuvoMascotas', 'tieneMascotas', 'experiencia'],
    ['motivo', 'acepta'],
];
const SELECT_KEYS: Key[] = ['ciudad', 'vivienda', 'patio', 'tuvoMascotas', 'tieneMascotas'];

function validate(v: Values, keys: Key[]): Errors {
    const errors: Errors = {};
    for (const k of keys) {
        if (k === 'acepta') {
            if (!v.acepta) errors.acepta = 'Debes aceptar para enviar la solicitud.';
            continue;
        }
        if (!v[k].trim()) errors[k] = SELECT_KEYS.includes(k) ? 'Selecciona una opción.' : 'Este campo es obligatorio.';
    }
    if (keys.includes('correo') && !errors.correo && !EMAIL_RE.test(v.correo.trim())) {
        errors.correo = 'Ingresa un correo válido.';
    }
    if (keys.includes('telefono') && !errors.telefono && v.telefono.replace(/\D/g, '').length < 9) {
        errors.telefono = 'Ingresa un número de teléfono válido.';
    }
    return errors;
}

function useIsDesktop() {
    const query = '(min-width: 800px)';
    const [isDesktop, setIsDesktop] = useState(() => window.matchMedia(query).matches);
    useEffect(() => {
        const mql = window.matchMedia(query);
        const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
        mql.addEventListener('change', onChange);
        return () => mql.removeEventListener('change', onChange);
    }, []);
    return isDesktop;
}

/* ===== Piezas del formulario ===== */
function Field({
                   k,
                   label,
                   error,
                   full,
                   children,
               }: {
    k: Key;
    label: string;
    error?: string;
    full?: boolean;
    children: ReactNode;
}) {
    return (
        <div className={`req-field${full ? ' req-field--full' : ''}`}>
            <label htmlFor={`req-${k}`} className="req-label">
                {label} <span className="req-required" aria-hidden="true">*</span>
            </label>
            {children}
            {error && (
                <p id={`req-${k}-error`} className="req-error" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}

function Select({
                    value,
                    options,
                    onChange,
                    aria,
                }: {
    value: string;
    options: string[];
    onChange: (value: string) => void;
    aria: object;
}) {
    return (
        <div className="req-select">
            <select
                {...aria}
                className={`req-input${value ? '' : ' is-empty'}`}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                <option value="">Selecciona una opción</option>
                {options.map((o) => (
                    <option key={o} value={o}>
                        {o}
                    </option>
                ))}
            </select>
            <IonIcon icon={chevronDown} aria-hidden="true" />
        </div>
    );
}

function TextArea({
                      value,
                      placeholder,
                      onChange,
                      aria,
                  }: {
    value: string;
    placeholder: string;
    onChange: (value: string) => void;
    aria: object;
}) {
    return (
        <div className="req-textarea">
            <textarea
                {...aria}
                className="req-input"
                maxLength={250}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
            <span className="req-count">{value.length}/250</span>
        </div>
    );
}

export default function AdoptionRequestPage() {
    const { animalId } = useParams<{ animalId: string }>();
    const { user } = useAuth();
    const isDesktop = useIsDesktop();
    const rootRef = useRef<HTMLDivElement>(null);

    const [animal, setAnimal] = useState<AnimalDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<'notfound' | 'failed' | null>(null);

    const [step, setStep] = useState(1);
    const [errors, setErrors] = useState<Errors>({});
    const [sending, setSending] = useState(false);
    const [sendError, setSendError] = useState('');
    const [done, setDone] = useState(false);
    const [values, setValues] = useState<Values>({
        nombre: '',
        correo: user?.email ?? '',
        telefono: '',
        ciudad: '',
        vivienda: '',
        patio: '',
        convive: '',
        tuvoMascotas: '',
        tieneMascotas: '',
        experiencia: '',
        motivo: '',
        acepta: false,
    });

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setLoadError(null);
        getAnimalPorId(animalId)
            .then((response) => {
                if (!cancelled) setAnimal(mapAnimalDetail(response?.data ?? response));
            })
            .catch((err) => {
                if (!cancelled) setLoadError(err?.response?.status === 404 ? 'notfound' : 'failed');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [animalId]);

    // Al cambiar de paso (móvil) vuelve al inicio
    useEffect(() => {
        rootRef.current?.closest('ion-content')?.scrollToTop(0);
    }, [step]);

    const set = <K extends Key>(key: K, value: Values[K]) => {
        setValues((v) => ({ ...v, [key]: value }));
        setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
    };

    const aria = (k: Key) => ({
        id: `req-${k}`,
        'aria-invalid': errors[k] ? true : undefined,
        'aria-describedby': errors[k] ? `req-${k}-error` : undefined,
    });

    const focusFirstError = () =>
        requestAnimationFrame(() =>
            rootRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
        );

    const goNext = () => {
        const stepErrors = validate(values, STEP_KEYS[step - 1]);
        setErrors(stepErrors);
        if (Object.keys(stepErrors).length > 0) {
            focusFirstError();
            return;
        }
        setStep((s) => Math.min(4, s + 1));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        // En móvil, Enter en un paso intermedio avanza en vez de enviar
        if (!isDesktop && step < 4) {
            goNext();
            return;
        }

        const all = validate(values, STEP_KEYS.flat());
        setErrors(all);
        const firstBad = STEP_KEYS.findIndex((keys) => keys.some((k) => all[k]));
        if (firstBad !== -1) {
            setStep(firstBad + 1);
            focusFirstError();
            return;
        }

        setSending(true);
        setSendError('');
        try {
            if (SIMULAR_ENVIO) {
                await new Promise((resolve) => setTimeout(resolve, 600));
            } else {
                // Nombre, correo, teléfono y ciudad salen de la cuenta (tabla usuarios)
                await createSolicitud({
                    animal_id: Number(animalId),
                    tipo_vivienda: values.vivienda,
                    tiene_patio: values.patio,
                    con_quien_convive: values.convive.trim(),
                    tuvo_mascotas: values.tuvoMascotas === 'Sí',
                    tiene_mascotas: values.tieneMascotas === 'Sí',
                    experiencia: values.experiencia.trim(),
                    motivo: values.motivo.trim(),
                    acepta_compromiso: true,
                });
            }
            setDone(true);
        } catch {
            setSendError('No se pudo enviar la solicitud. Intenta de nuevo.');
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="req-page req-page--center">
                <PawLoader label="Cargando…" />
            </div>
        );
    }

    if (loadError || !animal) {
        return (
            <div className="req-page req-page--center">
                <p>
                    {loadError === 'notfound'
                        ? 'No encontramos a este animal.'
                        : 'No se pudo cargar la información del animal.'}
                </p>
                <Link to="/adopciones" className="req-btn req-btn--auto">
                    Volver a adopciones
                </Link>
            </div>
        );
    }

    if (done) {
        return (
            <div className="req-page req-page--center req-done">
                <IonIcon icon={checkmarkCircleOutline} aria-hidden="true" />
                <h1>¡Solicitud enviada!</h1>
                <p className="selectable">
                    Revisaremos tu solicitud para adoptar a {animal.name} y nos pondremos en contacto contigo para
                    coordinar los siguientes pasos.
                </p>
                <Link to={`/adopciones/${animal.id}`} className="req-btn req-btn--auto">
                    Volver al animal
                </Link>
            </div>
        );
    }

    const hideUnless = (n: number) => (step === n ? '' : ' req-step-hidden');

    return (
        <div className="req-page" ref={rootRef}>
            <header className="req-head">
                <Link to={`/adopciones/${animal.id}`} className="req-back">
                    <IonIcon icon={chevronBack} aria-hidden="true" />
                    Volver al animal
                </Link>

                <ol className="req-stepper" aria-label="Pasos de la solicitud">
                    {STEP_LABELS.map((label, i) => {
                        const n = i + 1;
                        const state = n < step ? 'done' : n === step ? 'active' : 'todo';
                        return (
                            <li
                                key={label}
                                className={`req-stepper__item is-${state}`}
                                aria-current={n === step ? 'step' : undefined}
                            >
                                <span className="req-stepper__dot">
                                    {state === 'done' ? <IonIcon icon={checkmark} aria-hidden="true" /> : n}
                                </span>
                                <span className="req-stepper__label">{label}</span>
                            </li>
                        );
                    })}
                </ol>

                <div className={`req-intro${hideUnless(1)}`}>
                    <h1 className="req-title">
                        Da el primer paso hacia una <span>nueva Historia</span>
                    </h1>
                    <p className="req-intro__text selectable">
                        Completa la siguiente información para postular a la adopción.
                    </p>
                    <span className="req-badge">Solicitud de adopción</span>
                    <img src={doodle} alt="" className="req-doodle" />
                </div>
            </header>

            <div className="req-body">
                <img src={clouds} alt="" className="req-clouds" />

                <aside className={`req-animal${hideUnless(1)}`}>
                    <AdoptionGallery key={animal.id} photos={animal.photos} name={animal.name} />
                    <h2 className="req-animal__name">{animal.name}</h2>

                    <ul className="req-meta">
                        <li className="req-meta__age">
                            <IonIcon icon={calendarOutline} aria-hidden="true" />
                            {formatAge(animal.ageMonths)}
                        </li>
                        <li className="req-meta__size">
                            <img src={iconRegla} alt="" />
                            {capitalize(animal.size)}
                        </li>
                        <li className="req-meta__sex">
                            <img src={iconSexo} alt="" />
                            {capitalize(animal.sex)}
                        </li>
                        <li className="req-meta__city">
                            <IonIcon icon={locationOutline} aria-hidden="true" />
                            {animal.city}
                        </li>
                    </ul>

                    <div className="req-notes">
                        <div className="req-note">
                            <IonIcon icon={shieldOutline} aria-hidden="true" />
                            <div>
                                <h3 className="req-note__title">Proceso seguro</h3>
                                <p className="req-note__text selectable">
                                    Revisaremos tu solicitud y nos pondremos en contacto contigo para coordinar los
                                    siguientes pasos
                                </p>
                            </div>
                        </div>
                        <div className="req-note">
                            <IonIcon icon={heartOutline} aria-hidden="true" />
                            <div>
                                <h3 className="req-note__title">Adopción responsable</h3>
                                <p className="req-note__text selectable">
                                    Buscamos el mejor hogar posible para cada animal. Tu información nos ayuda a
                                    tomar una decisión adecuada.
                                </p>
                            </div>
                        </div>
                    </div>
                </aside>

                <form className="req-form" noValidate onSubmit={handleSubmit}>
                    {/* ===== 1. Tu información ===== */}
                    <section className={`req-section${hideUnless(1)}`} aria-labelledby="req-t1">
                        <h2 id="req-t1" className="req-section__title">
                            <IonIcon icon={personOutline} aria-hidden="true" />
                            Tu información
                        </h2>
                        <div className="req-grid">
                            <Field k="nombre" label="Nombre completo" error={errors.nombre}>
                                <input
                                    {...aria('nombre')}
                                    className="req-input"
                                    type="text"
                                    placeholder="Tu nombre completo"
                                    autoComplete="name"
                                    value={values.nombre}
                                    onChange={(e) => set('nombre', e.target.value)}
                                />
                            </Field>
                            <Field k="correo" label="Correo electrónico" error={errors.correo}>
                                <input
                                    {...aria('correo')}
                                    className="req-input"
                                    type="email"
                                    placeholder="tucorreo@ejemplo.com"
                                    autoComplete="email"
                                    value={values.correo}
                                    onChange={(e) => set('correo', e.target.value)}
                                />
                            </Field>
                            <Field k="telefono" label="Número de teléfono" error={errors.telefono}>
                                <input
                                    {...aria('telefono')}
                                    className="req-input"
                                    type="tel"
                                    placeholder="+56 9 1234 5678"
                                    autoComplete="tel"
                                    value={values.telefono}
                                    onChange={(e) => set('telefono', e.target.value)}
                                />
                            </Field>
                            <Field k="ciudad" label="Ciudad de residencia" error={errors.ciudad}>
                                <Select
                                    aria={aria('ciudad')}
                                    value={values.ciudad}
                                    options={CIUDADES}
                                    onChange={(v) => set('ciudad', v)}
                                />
                            </Field>
                        </div>
                    </section>

                    {/* ===== 2. Tu hogar ===== */}
                    <section className={`req-section${hideUnless(2)}`} aria-labelledby="req-t2">
                        <h2 id="req-t2" className="req-section__title">
                            <IonIcon icon={homeOutline} aria-hidden="true" />
                            Tu hogar
                        </h2>
                        <div className="req-grid">
                            <Field k="vivienda" label="¿Vives en?" error={errors.vivienda}>
                                <Select
                                    aria={aria('vivienda')}
                                    value={values.vivienda}
                                    options={VIVIENDAS}
                                    onChange={(v) => set('vivienda', v)}
                                />
                            </Field>
                            <Field k="patio" label="¿Cuentas con patio o espacio exterior?" error={errors.patio}>
                                <Select
                                    aria={aria('patio')}
                                    value={values.patio}
                                    options={SI_NO}
                                    onChange={(v) => set('patio', v)}
                                />
                            </Field>
                            <Field k="convive" label="¿Con quién convives?" error={errors.convive} full>
                                <TextArea
                                    aria={aria('convive')}
                                    value={values.convive}
                                    placeholder="Ej. familia, compañeros de departamento, etc."
                                    onChange={(v) => set('convive', v)}
                                />
                            </Field>
                        </div>
                    </section>

                    {/* ===== 3. Tu experiencia ===== */}
                    <section className={`req-section${hideUnless(3)}`} aria-labelledby="req-t3">
                        <h2 id="req-t3" className="req-section__title">
                            <IonIcon icon={starOutline} aria-hidden="true" />
                            Tu experiencia
                        </h2>
                        <div className="req-grid">
                            <Field k="tuvoMascotas" label="¿Has tenido mascotas antes?" error={errors.tuvoMascotas}>
                                <Select
                                    aria={aria('tuvoMascotas')}
                                    value={values.tuvoMascotas}
                                    options={SI_NO}
                                    onChange={(v) => set('tuvoMascotas', v)}
                                />
                            </Field>
                            <Field
                                k="tieneMascotas"
                                label="¿Actualmente tienes otras mascotas?"
                                error={errors.tieneMascotas}
                            >
                                <Select
                                    aria={aria('tieneMascotas')}
                                    value={values.tieneMascotas}
                                    options={SI_NO}
                                    onChange={(v) => set('tieneMascotas', v)}
                                />
                            </Field>
                            <Field k="experiencia" label="Cuéntanos tu experiencia" error={errors.experiencia} full>
                                <TextArea
                                    aria={aria('experiencia')}
                                    value={values.experiencia}
                                    placeholder="Experiencia ya sea con mascotas propias o cuidando animales..."
                                    onChange={(v) => set('experiencia', v)}
                                />
                            </Field>
                        </div>
                    </section>

                    {/* ===== 4. Tu compromiso ===== */}
                    <section className={`req-section${hideUnless(4)}`} aria-labelledby="req-t4">
                        <h2 id="req-t4" className="req-section__title">
                            <IonIcon icon={paw} aria-hidden="true" />
                            Tu compromiso
                        </h2>
                        <div className="req-grid">
                            <Field
                                k="motivo"
                                label={`¿Por qué te gustaría adoptar a ${animal.name}?`}
                                error={errors.motivo}
                                full
                            >
                                <TextArea
                                    aria={aria('motivo')}
                                    value={values.motivo}
                                    placeholder="Cuéntanos brevemente qué te motiva..."
                                    onChange={(v) => set('motivo', v)}
                                />
                            </Field>
                        </div>

                        <label className="req-check">
                            <input
                                {...aria('acepta')}
                                type="checkbox"
                                checked={values.acepta}
                                onChange={(e) => set('acepta', e.target.checked)}
                            />
                            <span>
                                Entiendo que la adopción implica un compromiso a largo plazo con su{' '}
                                <strong>bienestar, cuidado y tenencia responsable</strong>
                            </span>
                        </label>
                        {errors.acepta && (
                            <p id="req-acepta-error" className="req-error" role="alert">
                                {errors.acepta}
                            </p>
                        )}

                        {/* Solo desktop: en móvil se usan los botones de pasos */}
                        <button type="submit" className="req-btn req-submit" disabled={sending}>
                            {sending ? 'Enviando…' : 'Enviar solicitud'}
                            <IonIcon icon={arrowForward} aria-hidden="true" />
                        </button>
                    </section>

                    {sendError && (
                        <p className="req-error req-error--send" role="alert">
                            {sendError}
                        </p>
                    )}

                    {/* Solo móvil: Anterior / Siguiente / Enviar */}
                    <div className={`req-nav${step === 1 ? ' req-nav--single' : ''}`}>
                        {step > 1 && (
                            <button
                                type="button"
                                className="req-btn req-btn--outline"
                                onClick={() => setStep((s) => s - 1)}
                            >
                                <IonIcon icon={arrowBack} aria-hidden="true" />
                                Anterior
                            </button>
                        )}
                        {step < 4 ? (
                            <button type="button" className="req-btn" onClick={goNext}>
                                Siguiente
                                <IonIcon icon={arrowForward} aria-hidden="true" />
                            </button>
                        ) : (
                            <button type="submit" className="req-btn" disabled={sending}>
                                {sending ? 'Enviando…' : 'Enviar solicitud'}
                                <IonIcon icon={arrowForward} aria-hidden="true" />
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}