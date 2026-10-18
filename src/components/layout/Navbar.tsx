import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import { chevronDown, close, menu } from 'ionicons/icons';
import { useAuth } from '../../contexts/AuthContext';
import logoColor from '../../assets/images/logo/logo-color.svg';
import iconTenencia from '../../assets/icons/tenencia-responsable.svg';
import iconAbandono from '../../assets/icons/consecuencias-abandono.svg';
import './Navbar.css';
import MotionToggle from './MotionToggle';

const learnItems = [
    {
        to: '/educacion',
        icon: iconTenencia,
        title: 'Tenencia Responsable',
        text: 'Cuidados, bienestar y convivencia',
    },
    {
        to: '/educacion/consecuencias-abandono',
        icon: iconAbandono,
        title: 'Consecuencias del abandono',
        text: 'Impacto y cómo prevenirlo',
    },
];

function ArrowUpRight() {
    return (
        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
            <path
                d="M7 17 17 7M8 7h9v9"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

interface NavbarProps {
    scrolled?: boolean;
    onLogoClick?: () => void;
}

export default function Navbar({ scrolled = false, onLogoClick }: NavbarProps) {
    const { user, logout } = useAuth();
    const { pathname } = useLocation();
    const [open, setOpen] = useState(false);
    const [learnOpen, setLearnOpen] = useState(false);
    const learnRef = useRef<HTMLLIElement>(null);
    const closeMenu = () => setOpen(false);

    // Cierra el dropdown al hacer click fuera o con Escape
    useEffect(() => {
        if (!learnOpen) return;
        const onPointerDown = (e: PointerEvent) => {
            if (!learnRef.current?.contains(e.target as Node)) setLearnOpen(false);
        };
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setLearnOpen(false);
        };
        document.addEventListener('pointerdown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('pointerdown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [learnOpen]);

    return (
        <header className={`navbar${scrolled ? ' is-scrolled' : ''}`}>
            <div className="navbar__inner">
                <Link
                    to="/inicio"
                    className="navbar__brand"
                    onClick={(e) => {
                        closeMenu();
                        // Si ya estás en el inicio, sube con animación en vez de recargar la ruta
                        if (pathname === '/inicio' && onLogoClick) {
                            e.preventDefault();
                            onLogoClick();
                        }
                    }}
                >
                    <img src={logoColor} alt="Huellas al Hogar" className="navbar__logo" />
                </Link>

                <MotionToggle />

                <button
                    type="button"
                    className="navbar__toggle"
                    aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
                    aria-expanded={open}
                    aria-controls="main-nav"
                    onClick={() => setOpen((v) => !v)}
                >
                    <IonIcon icon={open ? close : menu} aria-hidden="true" />
                </button>

                <nav
                    id="main-nav"
                    className={`navbar__nav${open ? ' is-open' : ''}`}
                    aria-label="Navegación principal"
                >
                    <ul className="navbar__links">
                        <li>
                            <Link to="/adopciones" className="navbar__link" onClick={closeMenu}>
                                Adopciones <ArrowUpRight />
                            </Link>
                        </li>

                        <li
                            ref={learnRef}
                            className={`navbar__item navbar__item--dropdown${learnOpen ? ' is-open' : ''}`}
                            // Solo un mouse real abre por hover (el táctil dispara eventos falsos)
                            onPointerEnter={(e) => {
                                if (e.pointerType === 'mouse') setLearnOpen(true);
                            }}
                            onPointerLeave={(e) => {
                                if (e.pointerType === 'mouse') setLearnOpen(false);
                            }}
                        >
                            <button
                                type="button"
                                className="navbar__link navbar__link--button"
                                aria-expanded={learnOpen}
                                aria-haspopup="true"
                                onClick={() => setLearnOpen((v) => !v)}
                            >
                                Aprende{' '}
                                <IonIcon
                                    icon={chevronDown}
                                    className="navbar__chevron"
                                    aria-hidden="true"
                                />
                            </button>

                            <div className="navbar__dropdown">
                                <ul className="navbar__dropdown-panel">
                                    {learnItems.map((item) => (
                                        <li key={item.to}>
                                            <Link
                                                to={item.to}
                                                className="navbar__dropdown-item"
                                                onClick={() => {
                                                    setLearnOpen(false);
                                                    closeMenu();
                                                }}
                                            >
                                                <img
                                                    src={item.icon}
                                                    alt=""
                                                    className="navbar__dropdown-icon"
                                                />
                                                <span className="navbar__dropdown-copy">
                                                    <strong>{item.title}</strong>
                                                    <span>{item.text}</span>
                                                </span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </li>

                        {user?.role !== 'adoptante' && (
                            <li>
                                <Link to="/publicar" className="navbar__link" onClick={closeMenu}>
                                    Publicar Animal <ArrowUpRight />
                                </Link>
                            </li>
                        )}
                    </ul>

                    {user ? (
                        <button
                            type="button"
                            className="navbar__button"
                            onClick={() => {
                                logout();
                                closeMenu();
                            }}
                        >
                            Cerrar sesión
                        </button>
                    ) : (
                        <Link to="/login" className="navbar__button" onClick={closeMenu}>
                            Iniciar sesión
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
}