import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import { chevronDown, close, menu } from 'ionicons/icons';
import { useAuth } from '../../contexts/AuthContext';
import logoColor from '../../assets/images/logo/logo-color.svg';
import './Navbar.css';

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
    const closeMenu = () => setOpen(false);

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
                        <li>
                            <Link to="/educacion" className="navbar__link" onClick={closeMenu}>
                                Aprende <IonIcon icon={chevronDown} aria-hidden="true" />
                            </Link>
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