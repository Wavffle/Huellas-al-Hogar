import { useRef, useState } from 'react';
import { IonIcon } from '@ionic/react';
import { arrowBackCircleOutline, arrowForwardCircleOutline } from 'ionicons/icons';
import ContentState from '../common/ContentState';
import { imagenContenido } from '../../utils/contenido';
import { useBloques } from '../../utils/useBloques';
import './ConsequencesCarousel.css';

export default function ConsequencesCarousel() {
    const { items: consequences, loading, error, reload } = useBloques('CONSECUENCIAS');
    const [active, setActive] = useState(0);
    const touchStartX = useRef<number | null>(null);

    const go = (index: number) => {
        if (consequences.length === 0) return;
        setActive((index + consequences.length) % consequences.length);
    };

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

            <ContentState loading={loading} error={error} onRetry={reload} label="Cargando consecuencias…">
                <div className="aban-cons__viewport" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
                    <ul className="aban-cons__list">
                        {consequences.map((item, index) => (
                            <li
                                key={item.id}
                                className={`aban-cons-item${index === active ? ' is-active' : ''}`}
                            >
                                <img
                                    src={imagenContenido(item.imagen)}
                                    alt={item.alt ?? ''}
                                    className="aban-cons-item__image"
                                    loading="lazy"
                                />
                                <span className="aban-cons-item__tag">{item.titulo}</span>
                                <p className="aban-cons-item__text selectable">{item.texto}</p>
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
                                key={item.id}
                                type="button"
                                className={`aban-cons__dot${index === active ? ' is-active' : ''}`}
                                aria-label={`Ir a: ${item.titulo}`}
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
            </ContentState>
        </section>
    );
}
