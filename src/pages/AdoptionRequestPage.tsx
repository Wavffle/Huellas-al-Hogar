import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
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
import { CIUDADES } from '../data/ciudades';
import PawLoader from '../components/common/PawLoader';
import Field from '../components/forms/Field';
import Select from '../components/forms/Select';
import Choice from '../components/forms/Choice';
import TextArea from '../components/forms/TextArea';
import AdoptionGallery from '../components/adoptions/AdoptionGallery';
import { capitalize, mapAnimalDetail, type AnimalDetail } from '../components/adoptions/adoptionDetail';
import { formatAge } from '../components/adoptions/adoptionUtils';
import { useMotionOff } from '../utils/useMotionOff';
import { useIsDesktop } from '../utils/useIsDesktop';
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

const LOAD_MS = 1600; // duración de la barra de carga
const BURST_MS = 800; // duración de las chispas antes de mostrar la pantalla final
const SPARKS = 14;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type Phase = 'idle' | 'loading' | 'burst';

type Country = { code: string; name: string; dial: string; min: number; max: number };

/** Países frecuentes. min/max = cantidad de dígitos del número nacional. */
const COUNTRIES: Country[] = [
    { code: 'CL', name: 'Chile', dial: '+56', min: 9, max: 9 },
    { code: 'AR', name: 'Argentina', dial: '+54', min: 10, max: 11 },
    { code: 'BO', name: 'Bolivia', dial: '+591', min: 8, max: 8 },
    { code: 'BR', name: 'Brasil', dial: '+55', min: 10, max: 11 },
    { code: 'CO', name: 'Colombia', dial: '+57', min: 10, max: 10 },
    { code: 'EC', name: 'Ecuador', dial: '+593', min: 9, max: 9 },
    { code: 'ES', name: 'España', dial: '+34', min: 9, max: 9 },
    { code: 'US', name: 'Estados Unidos', dial: '+1', min: 10, max: 10 },
    { code: 'MX', name: 'México', dial: '+52', min: 10, max: 10 },
    { code: 'PY', name: 'Paraguay', dial: '+595', min: 9, max: 9 },
    { code: 'PE', name: 'Perú', dial: '+51', min: 9, max: 9 },
    { code: 'UY', name: 'Uruguay', dial: '+598', min: 8, max: 9 },
    { code: 'VE', name: 'Venezuela', dial: '+58', min: 10, max: 10 },
];
const DEFAULT_COUNTRY = 'CL';
const getCountry = (code: string) => COUNTRIES.find((c) => c.code === code) ?? COUNTRIES[0];

/** Solo dígitos, sin el prefijo del país si lo pegaron, y limitado al largo máximo. */
function cleanPhone(raw: string, country: Country): string {
    let digits = raw.replace(/\D/g, '');
    const dial = country.dial.slice(1);
    if (digits.length > country.max && digits.startsWith(dial)) digits = digits.slice(dial.length);
    return digits.slice(0, country.max);
}

type Values = {
    nombre: string;
    correo: string;
    pais: string;
    telefono: string;
    ciudad: string;
    vivienda: string;
    viviendaOtro: string;
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
    ['vivienda', 'viviendaOtro', 'patio', 'convive'],
    ['tuvoMascotas', 'tieneMascotas', 'experiencia'],
    ['motivo', 'acepta'],
];
const SELECT_KEYS: Key[] = ['ciudad', 'vivienda', 'patio', 'tuvoMascotas', 'tieneMascotas'];

/** id del control de cada campo (lo usan Field, aria y los mensajes de error). */
const fid = (k: Key) => `req-${k}`;

function validate(v: Values, keys: Key[]): Errors {
    const errors: Errors = {};
    for (const k of keys) {
        if (k === 'acepta') {
            if (!v.acepta) errors.acepta = 'Debes aceptar para enviar la solicitud.';
            continue;
        }
        // "¿Cuál?" solo es obligatorio cuando se eligió "Otro"
        if (k === 'viviendaOtro' && v.vivienda !== 'Otro') continue;
        if (!v[k].trim()) errors[k] = SELECT_KEYS.includes(k) ? 'Selecciona una opción.' : 'Este campo es obligatorio.';
    }
    if (keys.includes('correo') && !errors.correo && !EMAIL_RE.test(v.correo.trim())) {
        errors.correo = 'Ingresa un correo válido.';
    }
    if (keys.includes('telefono') && !errors.telefono) {
        const c = getCountry(v.pais);
        const len = v.telefono.length;
        if (len < c.min || len > c.max) {
            errors.telefono =
                c.min === c.max
                    ? `Ingresa un número de ${c.min} dígitos para ${c.name}.`
                    : `Ingresa un número de ${c.min} a ${c.max} dígitos para ${c.name}.`;
        } else if (v.pais === 'CL' && !v.telefono.startsWith('9')) {
            errors.telefono = 'Los celulares de Chile empiezan con 9.';
        }
    }
    return errors;
}

function SubmitButton({ phase, className = '' }: { phase: Phase; className?: string }) {
    const busy = phase !== 'idle';
    return (
        <button
            type="submit"
            className={`req-btn req-send ${className}${busy ? ` is-${phase}` : ''}`}
            disabled={busy}
            style={{ '--load': `${LOAD_MS}ms` } as CSSProperties}
        >
            <span className="req-send__fill" aria-hidden="true" />
            <span className="req-send__label">
                {phase === 'burst' ? '¡Listo!' : busy ? 'Enviando…' : 'Enviar solicitud'}
            </span>
            <IonIcon icon={arrowForward} aria-hidden="true" />
            {phase === 'burst' && (
                <span className="req-sparks" aria-hidden="true">
                    {Array.from({ length: SPARKS }, (_, i) => (
                        <span
                            key={i}
                            style={
                                {
                                    '--angle': `${(360 / SPARKS) * i}deg`,
                                    '--dist': `${i % 2 ? 4.2 : 6}rem`,
                                } as CSSProperties
                            }
                        >
                            <i />
                        </span>
                    ))}
                </span>
            )}
        </button>
    );
}

export default function AdoptionRequestPage() {
    const { animalId } = useParams<{ animalId: string }>();
    const { user } = useAuth();
    const isDesktop = useIsDesktop();
    const motionOff = useMotionOff();
    const rootRef = useRef<HTMLDivElement>(null);

    const [animal, setAnimal] = useState<AnimalDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<'notfound' | 'failed' | null>(null);

    const [step, setStep] = useState(1);
    const [errors, setErrors] = useState<Errors>({});
    const [phase, setPhase] = useState<Phase>('idle');
    const sending = phase !== 'idle';
    const [sendError, setSendError] = useState('');
    const [done, setDone] = useState(false);
    const [values, setValues] = useState<Values>({
        nombre: '',
        correo: user?.email ?? '',
        pais: DEFAULT_COUNTRY,
        telefono: '',
        ciudad: '',
        vivienda: '',
        viviendaOtro: '',
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

    const setVivienda = (value: string) => {
        setValues((v) => ({ ...v, vivienda: value, viviendaOtro: value === 'Otro' ? v.viviendaOtro : '' }));
        setErrors((e) => ({ ...e, vivienda: undefined, ...(value !== 'Otro' ? { viviendaOtro: undefined } : {}) }));
    };

    const aria = (k: Key) => ({
        id: fid(k),
        'aria-invalid': errors[k] ? true : undefined,
        'aria-describedby': errors[k] ? `${fid(k)}-error` : undefined,
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
        if (sending) return;
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

        setPhase('loading');
        setSendError('');
        try {
            // Nombre, correo, teléfono y ciudad salen de la cuenta (tabla usuarios)
            const request = SIMULAR_ENVIO
                ? Promise.resolve()
                : createSolicitud({
                    animal_id: Number(animalId),
                    tipo_vivienda: values.vivienda === 'Otro' ? values.viviendaOtro.trim() : values.vivienda,
                    tiene_patio: values.patio,
                    con_quien_convive: values.convive.trim(),
                    tuvo_mascotas: values.tuvoMascotas === 'Sí',
                    tiene_mascotas: values.tieneMascotas === 'Sí',
                    experiencia: values.experiencia.trim(),
                    motivo: values.motivo.trim(),
                    acepta_compromiso: true,
                });

            // La barra dura al menos LOAD_MS; si el servidor tarda más, espera al 100%
            await Promise.all([request, wait(motionOff ? 0 : LOAD_MS)]);
            if (!motionOff) {
                setPhase('burst');
                await wait(BURST_MS);
            }
            setDone(true);
        } catch {
            setSendError('No se pudo enviar la solicitud. Intenta de nuevo.');
            setPhase('idle');
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
                            <Field id={fid('nombre')} label="Nombre completo" error={errors.nombre}>
                                <input
                                    {...aria('nombre')}
                                    className="form-input"
                                    type="text"
                                    placeholder="Tu nombre completo"
                                    autoComplete="name"
                                    value={values.nombre}
                                    onChange={(e) => set('nombre', e.target.value)}
                                />
                            </Field>
                            <Field id={fid('correo')} label="Correo electrónico" error={errors.correo}>
                                <input
                                    {...aria('correo')}
                                    className="form-input"
                                    type="email"
                                    placeholder="tucorreo@ejemplo.com"
                                    autoComplete="email"
                                    value={values.correo}
                                    onChange={(e) => set('correo', e.target.value)}
                                />
                            </Field>
                            <Field id={fid('telefono')} label="Número de teléfono" error={errors.telefono}>
                                <div className="req-phone">
                                    <div className="req-phone__country">
                                        <select
                                            className="form-input"
                                            aria-label="País del teléfono"
                                            value={values.pais}
                                            onChange={(e) => {
                                                const c = getCountry(e.target.value);
                                                setValues((v) => ({ ...v, pais: c.code, telefono: cleanPhone(v.telefono, c) }));
                                                setErrors((er) => (er.telefono ? { ...er, telefono: undefined } : er));
                                            }}
                                        >
                                            {COUNTRIES.map((c) => (
                                                <option key={c.code} value={c.code}>
                                                    {c.code} {c.dial}
                                                </option>
                                            ))}
                                        </select>
                                        <IonIcon icon={chevronDown} aria-hidden="true" />
                                    </div>
                                    <input
                                        {...aria('telefono')}
                                        className="form-input"
                                        type="tel"
                                        inputMode="numeric"
                                        autoComplete="tel-national"
                                        placeholder={'9'.padEnd(getCountry(values.pais).min, '1')}
                                        value={values.telefono}
                                        onChange={(e) => set('telefono', cleanPhone(e.target.value, getCountry(values.pais)))}
                                    />
                                </div>
                            </Field>
                            <Field id={fid('ciudad')} label="Ciudad de residencia" error={errors.ciudad}>
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
                        <div className="req-grid req-grid--home">
                            <Field id={fid('vivienda')} label="¿Vives en?" error={errors.vivienda} group>
                                <Choice
                                    id={fid('vivienda')}
                                    value={values.vivienda}
                                    options={VIVIENDAS}
                                    error={errors.vivienda}
                                    onChange={setVivienda}
                                />
                            </Field>
                            <Field
                                id={fid('patio')}
                                label="¿Cuentas con patio o espacio exterior?"
                                error={errors.patio}
                                group
                            >
                                <Choice
                                    id={fid('patio')}
                                    value={values.patio}
                                    options={SI_NO}
                                    error={errors.patio}
                                    onChange={(v) => set('patio', v)}
                                />
                            </Field>
                            <div className={`req-reveal${values.vivienda === 'Otro' ? ' is-open' : ''}`}>
                                <div className="req-reveal__inner">
                                    <Field id={fid('viviendaOtro')} label="¿Cuál?" error={errors.viviendaOtro} full>
                                        <input
                                            {...aria('viviendaOtro')}
                                            className="form-input"
                                            type="text"
                                            maxLength={60}
                                            placeholder="Ej. parcela, pieza arrendada, etc."
                                            value={values.viviendaOtro}
                                            onChange={(e) => set('viviendaOtro', e.target.value)}
                                        />
                                    </Field>
                                </div>
                            </div>
                            <Field id={fid('convive')} label="¿Con quién convives?" error={errors.convive} full>
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
                            <Field
                                id={fid('tuvoMascotas')}
                                label="¿Has tenido mascotas antes?"
                                error={errors.tuvoMascotas}
                                group
                            >
                                <Choice
                                    id={fid('tuvoMascotas')}
                                    value={values.tuvoMascotas}
                                    options={SI_NO}
                                    error={errors.tuvoMascotas}
                                    onChange={(v) => set('tuvoMascotas', v)}
                                />
                            </Field>
                            <Field
                                id={fid('tieneMascotas')}
                                label="¿Actualmente tienes otras mascotas?"
                                error={errors.tieneMascotas}
                                group
                            >
                                <Choice
                                    id={fid('tieneMascotas')}
                                    value={values.tieneMascotas}
                                    options={SI_NO}
                                    error={errors.tieneMascotas}
                                    onChange={(v) => set('tieneMascotas', v)}
                                />
                            </Field>
                            <Field id={fid('experiencia')} label="Cuéntanos tu experiencia" error={errors.experiencia} full>
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
                                id={fid('motivo')}
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

                        <div className="req-check">
                            <input
                                {...aria('acepta')}
                                type="checkbox"
                                checked={values.acepta}
                                onChange={(e) => set('acepta', e.target.checked)}
                                aria-label="Entiendo que la adopción implica un compromiso a largo plazo con su bienestar, cuidado y tenencia responsable"
                            />
                            <p className="req-check__text selectable">
                                Entiendo que la adopción implica un compromiso a largo plazo con su{' '}
                                <strong>bienestar, cuidado y tenencia responsable</strong>
                            </p>
                        </div>
                        {errors.acepta && (
                            <p id="req-acepta-error" className="req-error" role="alert">
                                {errors.acepta}
                            </p>
                        )}

                        {/* Solo desktop: en móvil se usan los botones de pasos */}
                        <SubmitButton phase={phase} className="req-submit" />
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
                            <SubmitButton phase={phase} />
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
