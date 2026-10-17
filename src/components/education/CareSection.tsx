import { careCards } from '../data/education';
import './CareSection.css';

/* Una frase de la marquesina. Solo la primera se lee con lector de pantalla */
function MarqueePhrase({ hidden }: { hidden: boolean }) {
    return (
        <span className="care__phrase" aria-hidden={hidden || undefined}>
            <span className="care__w care__w--display">Cinco</span>{' '}
            <span className="care__w care__w--soft">cosas</span>{' '}
            <span className="care__w care__w--body">a tener</span>{' '}
            <span className="care__w care__w--soft">en</span>{' '}
            <span className="care__w care__w--display">cuenta</span>
            <span className="care__sep care__w--display" aria-hidden="true">-</span>
        </span>
    );
}

export default function CareSection() {
    return (
        <section className="care" aria-labelledby="care-title">
            <h2 id="care-title" className="care__heading">
                <span className="care__track">
                    {[0, 1].map((group) => (
                        <span key={group} className="care__group" aria-hidden={group > 0 || undefined}>
                            {[0, 1, 2].map((phrase) => (
                                <MarqueePhrase key={phrase} hidden={group > 0 || phrase > 0} />
                            ))}
                        </span>
                    ))}
                </span>
            </h2>

            <ul className="care__grid">
                {careCards.map((card) => (
                    <li key={card.title} className={`care-card care-card--${card.tone}`}>
                        <img src={card.image} alt={card.alt} className="care-card__image" loading="lazy" />
                        <div className="care-card__body">
                            <h3 className="care-card__title">{card.title}</h3>
                            <p className="care-card__text selectable">{card.text}</p>
                        </div>
                    </li>
                ))}

                <li className="care__quote">
                    <p className="care__quote-text">Pequeñas acciones, grandes cambios</p>
                    <svg className="care__quote-art" viewBox="0 0 120 90" aria-hidden="true">
                        <path
                            d="M72 4C60 4 52 12 52 24c0 16 16 28 22 34 6-6 22-18 22-34C96 12 88 4 76 4c-2 0-3 0-4 0z"
                            transform="rotate(18 74 30)"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M4 84C16 70 40 88 66 70c10-7 18-16 22-26"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.2"
                            strokeDasharray="4 4"
                            strokeLinecap="round"
                            opacity="0.7"
                        />
                    </svg>
                </li>
            </ul>
        </section>
    );
}
