import type { CSSProperties } from 'react';
import heroImage from '../../assets/images/consequences/hero-abandono.webp';
import './ConsequencesHero.css';

const TITLE = 'Detrás de cada animal en la calle hay una historia que pudo ser distinta.';

export default function ConsequencesHero() {
    return (
        <section className="aban-hero" aria-labelledby="aban-hero-title">
            <img src={heroImage} alt="Un gatito y un gato en la calle" className="aban-hero__image" />

            {/* El h1 conserva el texto completo para lectores de pantalla;
                las palabras sueltas son solo para la animación */}
            <h1 id="aban-hero-title" className="aban-hero__title" aria-label={TITLE}>
                {TITLE.split(' ').map((word, index) => (
                    <span key={index}>
                        <span
                            className="aban-hero__word"
                            style={{ '--i': index } as CSSProperties}
                            aria-hidden="true"
                        >
                            {word}
                        </span>{' '}
                    </span>
                ))}
            </h1>
        </section>
    );
}
