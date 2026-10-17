import catImage from '../../assets/images/education/gato-hero.webp';
import './EducationHero.css';

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

function Heart({ className }: { className: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
            <path
                d="M12 21s-7.5-4.6-9.5-9.2C1 8.3 3.2 5 6.4 5c2 0 3.6 1.1 4.6 2.7C12 6.1 13.6 5 15.6 5c3.2 0 5.4 3.3 3.9 6.8C19.5 16.4 12 21 12 21z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export default function EducationHero() {
    return (
        <section className="edu-hero" aria-labelledby="edu-hero-title">
            <div className="edu-hero__visual">
                {/* Fondo: lila con una mancha crema */}
                <div className="edu-hero__bg" aria-hidden="true">
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path
                            d="M0 9 C10 8 22 12 34 11 C48 10 56 14 62 24 C68 36 66 52 70 64 C74 78 82 92 96 100 L0 100 Z"
                            fill="var(--edu-cream-light)"
                        />
                    </svg>
                </div>

                {/* Línea punteada */}
                <svg className="edu-hero__dash" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                    <path
                        d="M-3 78 C-5 60 -3 44 0 30 C6 20 14 18 22 21 C30 16 40 14 47 26 C51 34 50 48 45 62"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeDasharray="5 5"
                        vectorEffect="non-scaling-stroke"
                    />
                </svg>

                <Heart className="edu-hero__heart edu-hero__heart--1" />
                <Heart className="edu-hero__heart edu-hero__heart--2" />
                <Heart className="edu-hero__heart edu-hero__heart--3" />
                <Paw className="edu-hero__paw edu-hero__paw--1" />
                <Paw className="edu-hero__paw edu-hero__paw--2" />

                <img
                    src={catImage}
                    alt="Un gato atigrado mirando hacia arriba"
                    className="edu-hero__cat"
                />
            </div>

            <div className="edu-hero__copy">
                <h1 id="edu-hero-title" className="edu-hero__title">
                    Cuidar también es <em>comprometerse.</em>
                </h1>
                <p className="edu-hero__text selectable">
                    Tener un animal significa asumir una{' '}
                    <br className="edu-hero__br" />
                    responsabilidad durante toda su vida.{' '}
                    <br className="edu-hero__br" />
                    Alimentación, salud, seguridad, afecto y{' '}
                    <br className="edu-hero__br" />
                    tiempo forman parte de su bienestar y{' '}
                    <br className="edu-hero__br" />
                    ayudan a prevenir el abandono.
                </p>
            </div>

            <p className="edu-hero__lead selectable">
                Una adopción responsable comienza antes de llevar un animal a casa. Conocer sus
                necesidades y evaluar si podemos cubrirlas permite construir una convivencia más
                segura y duradera
            </p>
        </section>
    );
}
