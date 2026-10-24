import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { IonContent, IonIcon, IonPage } from '@ionic/react';
import { arrowBack, eyeOffOutline, eyeOutline, paw } from 'ionicons/icons';
import { useAuth } from '../contexts/AuthContext';
import { authErrorMessage, iniciarSesion, registrarUsuario } from '../services/authService';
import logoColor from '../assets/images/logo/logo-color.svg';
import logoClaro from '../assets/images/logo/logo-claro.svg';
import patternLogin from '../assets/images/login/patron-fondo.webp';
import patternRegister from '../assets/images/login/patron-registro.webp';
import './LoginPage.css';

export default function LoginPage() {
    const history = useHistory();
    const { pathname, state } = useLocation<{ from?: { pathname: string; search?: string } } | undefined>();
    const redirectTo = state?.from ? `${state.from.pathname}${state.from.search ?? ''}` : '/inicio';

    const goBack = () => {
        if (history.length > 1) history.goBack();
        else history.push('/inicio');
    };
    const { login } = useAuth();
    const isRegister = pathname === '/registro';

    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [accepted, setAccepted] = useState(false);

    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regConfirm, setRegConfirm] = useState('');
    const [busy, setBusy] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [registerError, setRegisterError] = useState('');

    const switchView = (path: '/login' | '/registro') => {
        setLoginError('');
        setRegisterError('');
        history.replace(path, state);
    };

    const submitLogin = async (e: FormEvent) => {
        e.preventDefault();
        if (busy) return;
        setLoginError('');
        setBusy(true);
        try {
            const session = await iniciarSesion(loginEmail.trim(), loginPassword, remember);
            login(session);
            history.replace(redirectTo);
        } catch (err) {
            setLoginError(authErrorMessage(err));
            setBusy(false);
        }
    };

    const submitRegister = async (e: FormEvent) => {
        e.preventDefault();
        if (busy) return;
        setRegisterError('');

        // Mismas reglas que el backend (mínimo 8 caracteres, máximo 72 bytes)
        if (regPassword.length < 8) {
            setRegisterError('La contraseña debe tener al menos 8 caracteres.');
            return;
        }
        if (new TextEncoder().encode(regPassword).length > 72) {
            setRegisterError('La contraseña es demasiado larga.');
            return;
        }
        if (regPassword !== regConfirm) {
            setRegisterError('Las contraseñas no coinciden.');
            return;
        }

        setBusy(true);
        try {
            const session = await registrarUsuario(regName.trim(), regEmail.trim(), regPassword);
            login(session);
            history.replace(redirectTo);
        } catch (err) {
            setRegisterError(authErrorMessage(err));
            setBusy(false);
        }
    };

    useEffect(() => {
        [patternLogin, patternRegister].forEach((src) => {
            const img = new Image();
            img.src = src;
            img.decode?.().catch(() => {});
        });
    }, []);

    return (
        <IonPage>
            <IonContent fullscreen>
                <div className={`login${isRegister ? ' login--register' : ''}`}>
                    <section className="login__side">
                        <div className="login__curtain" aria-hidden="true">
                            <div
                                className="login__curtain-img"
                                style={{ backgroundImage: `url(${patternRegister})` }}
                            />
                        </div>
                        {/* ===== Vista: iniciar sesión ===== */}
                        <div
                            className={`login__view${!isRegister ? ' is-active' : ''}`}
                            aria-hidden={isRegister}
                        >
                            <button type="button" className="login__back" tabIndex={isRegister ? -1 : 0} onClick={goBack}>
                                <IonIcon icon={arrowBack} aria-hidden="true" />
                                Volver
                            </button>

                            <div className="login__card">
                                <img src={logoColor} alt="Huellas al Hogar" className="login__logo" />

                                <h1 className="login__title">¡Bienvenido de vuelta!</h1>
                                <p className="login__subtitle">
                                    Ingresa en tu cuenta para seguir ayudando a<br className="login__br" /> más
                                    animales.
                                </p>

                                <form className="login__form" onSubmit={submitLogin}>
                                    <input
                                        type="email"
                                        name="email"
                                        className="login__input"
                                        placeholder="tucorreo@ejemplo.com"
                                        aria-label="Correo electrónico"
                                        autoComplete="email"
                                        tabIndex={isRegister ? -1 : 0}
                                        value={loginEmail}
                                        onChange={(e) => setLoginEmail(e.target.value)}
                                        required
                                    />

                                    <div className="login__field">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            className="login__input login__input--password"
                                            placeholder="Tu contraseña"
                                            aria-label="Contraseña"
                                            autoComplete="current-password"
                                            tabIndex={isRegister ? -1 : 0}
                                            value={loginPassword}
                                            onChange={(e) => setLoginPassword(e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="login__eye"
                                            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                            aria-pressed={showPassword}
                                            tabIndex={isRegister ? -1 : 0}
                                            onClick={() => setShowPassword((v) => !v)}
                                        >
                                            <IonIcon
                                                icon={showPassword ? eyeOffOutline : eyeOutline}
                                                aria-hidden="true"
                                            />
                                        </button>
                                    </div>

                                    <div className="login__remember">
                                        <input
                                            type="checkbox"
                                            checked={remember}
                                            aria-label="Mantener sesión iniciada"
                                            tabIndex={isRegister ? -1 : 0}
                                            onChange={(e) => setRemember(e.target.checked)}
                                        />
                                        <span>Mantener sesión iniciada</span>
                                    </div>

                                    {loginError && (
                                        <p className="login__error" role="alert">
                                            {loginError}
                                        </p>
                                    )}

                                    <button
                                        type="submit"
                                        className="login__submit"
                                        tabIndex={isRegister ? -1 : 0}
                                        disabled={busy}
                                    >
                                        {busy && !isRegister ? 'Ingresando…' : 'Iniciar Sesión'}
                                    </button>
                                </form>

                                <p className="login__register">
                                    <span>
                                        ¿No tienes una cuenta?{' '}
                                        <button
                                            type="button"
                                            className="login__register-link"
                                            tabIndex={isRegister ? -1 : 0}
                                            onClick={() => switchView('/registro')}
                                        >
                                            Regístrate
                                        </button>
                                    </span>
                                </p>
                            </div>
                        </div>

                        {/* ===== Vista: crear cuenta ===== */}
                        <div
                            className={`login__view login__view--register${isRegister ? ' is-active' : ''}`}
                            aria-hidden={!isRegister}
                        >
                            <button type="button" className="login__back" tabIndex={isRegister ? 0 : -1} onClick={goBack}>
                                <IonIcon icon={arrowBack} aria-hidden="true" />
                                Volver
                            </button>

                            <div className="login__card">
                                <img src={logoClaro} alt="Huellas al Hogar" className="login__logo" />

                                <h2 className="login__title">Crea tu cuenta</h2>
                                <p className="login__subtitle">
                                    Únete a nuestra comunidad y sé parte del<br className="login__br" /> cambio
                                </p>

                                <form className="login__form" onSubmit={submitRegister}>
                                    <label className="login__group">
                                        <span className="login__label">Nombre completo</span>
                                        <input
                                            type="text"
                                            className="login__input"
                                            placeholder="Tu nombre completo"
                                            autoComplete="name"
                                            maxLength={100}
                                            tabIndex={isRegister ? 0 : -1}
                                            value={regName}
                                            onChange={(e) => setRegName(e.target.value)}
                                            required
                                        />
                                    </label>

                                    <label className="login__group">
                                        <span className="login__label">Correo electrónico</span>
                                        <input
                                            type="email"
                                            className="login__input"
                                            placeholder="tucorreo@ejemplo.com"
                                            autoComplete="email"
                                            maxLength={150}
                                            tabIndex={isRegister ? 0 : -1}
                                            value={regEmail}
                                            onChange={(e) => setRegEmail(e.target.value)}
                                            required
                                        />
                                    </label>

                                    <div className="login__group">
                                        <label htmlFor="reg-pass" className="login__label">
                                            Contraseña
                                        </label>
                                        <div className="login__field">
                                            <input
                                                id="reg-pass"
                                                type={showNew ? 'text' : 'password'}
                                                className="login__input login__input--password"
                                                placeholder="Crea tu contraseña"
                                                autoComplete="new-password"
                                                tabIndex={isRegister ? 0 : -1}
                                                value={regPassword}
                                                onChange={(e) => setRegPassword(e.target.value)}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="login__eye"
                                                aria-label={showNew ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                                aria-pressed={showNew}
                                                tabIndex={isRegister ? 0 : -1}
                                                onClick={() => setShowNew((v) => !v)}
                                            >
                                                <IonIcon
                                                    icon={showNew ? eyeOffOutline : eyeOutline}
                                                    aria-hidden="true"
                                                />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="login__group">
                                        <label htmlFor="reg-confirm" className="login__label">
                                            Confirmar contraseña
                                        </label>
                                        <div className="login__field">
                                            <input
                                                id="reg-confirm"
                                                type={showConfirm ? 'text' : 'password'}
                                                className="login__input login__input--password"
                                                placeholder="Repite tu contraseña"
                                                autoComplete="new-password"
                                                tabIndex={isRegister ? 0 : -1}
                                                value={regConfirm}
                                                onChange={(e) => setRegConfirm(e.target.value)}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="login__eye"
                                                aria-label={showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                                aria-pressed={showConfirm}
                                                tabIndex={isRegister ? 0 : -1}
                                                onClick={() => setShowConfirm((v) => !v)}
                                            >
                                                <IonIcon
                                                    icon={showConfirm ? eyeOffOutline : eyeOutline}
                                                    aria-hidden="true"
                                                />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="login__remember login__remember--light login__terms">
                                        <input
                                            type="checkbox"
                                            checked={accepted}
                                            aria-label="Aceptar términos y condiciones y política de privacidad"
                                            tabIndex={isRegister ? 0 : -1}
                                            onChange={(e) => setAccepted(e.target.checked)}
                                            required
                                        />
                                        <span>
                                            Acepto los <strong>Términos y Condiciones</strong> y la{' '}
                                            <strong>Política de Privacidad</strong>
                                        </span>
                                    </div>

                                    {registerError && (
                                        <p className="login__error" role="alert">
                                            {registerError}
                                        </p>
                                    )}

                                    <button
                                        type="submit"
                                        className="login__submit login__submit--light"
                                        tabIndex={isRegister ? 0 : -1}
                                        disabled={busy}
                                    >
                                        {busy && isRegister ? 'Creando cuenta…' : 'Crear cuenta'}
                                        <IonIcon icon={paw} aria-hidden="true" />
                                    </button>
                                </form>

                                <p className="login__register">
                                    <span>
                                        ¿Ya tienes una cuenta?{' '}
                                        <button
                                            type="button"
                                            className="login__register-link"
                                            tabIndex={isRegister ? 0 : -1}
                                            onClick={() => switchView('/login')}
                                        >
                                            Inicia sesión
                                        </button>
                                    </span>
                                </p>
                            </div>
                        </div>
                    </section>

                    <div className="login__art" aria-hidden="true">
                        <div
                            className="login__art-layer"
                            style={{ backgroundImage: `url(${patternLogin})` }}
                        />
                        <div
                            className="login__art-layer login__art-layer--register"
                            style={{ backgroundImage: `url(${patternRegister})` }}
                        />
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
}