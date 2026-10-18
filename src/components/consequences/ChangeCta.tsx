import { Link } from 'react-router-dom';
import houseIcon from '../../assets/icons/casa-cambio.svg';
import './ChangeCta.css';

function Paw({ className }: { className: string }) {
    return (
        <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
            <ellipse cx="12" cy="28" rx="6" ry="8.5" transform="rotate(-25 12 28)" />
            <ellipse cx="25" cy="14" rx="6.5" ry="9" transform="rotate(-8 25 14)" />
            <ellipse cx="40" cy="14" rx="6.5" ry="9" transform="rotate(8 40 14)" />
            <ellipse cx="53" cy="28" rx="6" ry="8.5" transform="rotate(25 53 28)" />
            <path d="M32 30c-10 0-18 9-18 17 0 6 5 8 10 7 4-1 5-2 8-2s4 1 8 2c5 1 10-1 10-7 0-8-8-17-18-17z" />
        </svg>
    );
}

export default function ChangeCta() {
    return (
        <section className="aban-cta" aria-labelledby="aban-cta-title">
            <div className="aban-cta__inner">
                <img src={houseIcon} alt="" className="aban-cta__house" />

                <div className="aban-cta__copy">
                    <h2 id="aban-cta-title" className="aban-cta__title">
                        Tu puedes ser parte del cambio
                        <Paw className="aban-cta__paw" />
                    </h2>
                    <p className="aban-cta__text selectable">
                        Cada decisión cuenta. Adopta, educa y ayuda a crear un futuro con menos animales
                        abandonados y más historias con un final feliz.
                    </p>
                </div>

                <Link to="/adopciones" className="aban-cta__button">
                    Ver animales en adopción
                </Link>

                {/* Línea punteada decorativa */}
                <svg
                    className="aban-cta__dash"
                    viewBox="0 0 100 60"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                >
                    <path
                        d="M0 34 C14 37 26 46 38 42 C50 38 54 20 66 19 C78 18 84 36 90 50 C94 58 100 58 99.6 38 C99.4 26 100 12 100 3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeDasharray="5 5"
                        vectorEffect="non-scaling-stroke"
                    />
                </svg>
            </div>
        </section>
    );
}
