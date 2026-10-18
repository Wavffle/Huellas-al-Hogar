import { useRef, useState } from 'react';
import { IonIcon } from '@ionic/react';
import { arrowBackCircleOutline, arrowForwardCircleOutline } from 'ionicons/icons';
import { consequences } from '../data/consequences';
import './ConsequencesCarousel.css';

export default function ConsequencesCarousel() {
    const [active, setActive] = useState(0);
    const touchStartX = useRef<number | null>(null);

    const go = (index: number) =>
        setActive((index + consequences.length) % consequences.length);

    // Deslizar con el dedo (solo se usa en móvil, donde se ve de a una)
    const onTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };
    const onTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null) return;
        const diff = e.changedTouches[0].clientX - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(diff) > 40) go(diff < 0 ? active + 1 : active - 1);
    };

    return (
        <section className="aban-cons" aria-labelledby="aban-cons-title">
            <h2 id="aban-cons-title" className="aban-cons__title">
                Principales consecuencias.
            </h2>

            <div className="aban-cons__viewport" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
                <ul className="aban-cons__list">
                    {consequences.map((item, index) => (
                        <li
                            key={item.tag}
                            className={`aban-cons-item${index === active ? ' is-active' : ''}`}
                        >
                            <img src={item.image} alt={item.alt} className="aban-cons-item__image" loading="lazy" />
                            <span className="aban-cons-item__tag">{item.tag}</span>
                            <p className="aban-cons-item__text selectable">{item.text}</p>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Controles: solo en móvil */}
            <div className="aban-cons__nav">
                <button
                    type="button"
                    className="aban-cons__arrow"
                    aria-label="Consecuencia anterior"
                    onClick={() => go(active - 1)}
                >
                    <IonIcon icon={arrowBackCircleOutline} aria-hidden="true" />
                </button>

                <div className="aban-cons__dots">
                    {consequences.map((item, index) => (
                        <button
                            key={item.tag}
                            type="button"
                            className={`aban-cons__dot${index === active ? ' is-active' : ''}`}
                            aria-label={`Ir a: ${item.tag}`}
                            aria-current={index === active || undefined}
                            onClick={() => go(index)}
                        />
                    ))}
                </div>

                <button
                    type="button"
                    className="aban-cons__arrow"
                    aria-label="Consecuencia siguiente"
                    onClick={() => go(active + 1)}
                >
                    <IonIcon icon={arrowForwardCircleOutline} aria-hidden="true" />
                </button>
            </div>
        </section>
    );
}
