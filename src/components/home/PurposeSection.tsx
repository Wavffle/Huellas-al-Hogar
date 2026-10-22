import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { purposeSteps } from '../../data/purposeSteps';
import purposeImage from '../../assets/images/purpose/perro-gato.webp';
import clouds from '../../assets/images/purpose/nubes-fondo.webp';
import './PurposeSection.css';

/** Progreso del scroll (0 a 1) al que aparece cada paso. */
const THRESHOLDS = [0.1, 0.4, 0.7];
const DESKTOP_QUERY = '(min-width: 800px)';

export default function PurposeSection() {
    const wrapperRef = useRef<HTMLElement>(null);
    const [count, setCount] = useState(0);

    useEffect(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;

        // En móvil no hay efecto: se muestran todos los pasos
        if (!window.matchMedia(DESKTOP_QUERY).matches) {
            setCount(purposeSteps.length);
            return;
        }

        let scrollEl: HTMLElement | null = null;
        let cancelled = false;

        const update = () => {
            if (!scrollEl) return;
            const viewTop = scrollEl.getBoundingClientRect().top;
            const wrapperTop = wrapper.getBoundingClientRect().top;
            const scrollable = wrapper.offsetHeight - scrollEl.clientHeight;
            if (scrollable <= 0) {
                setCount(purposeSteps.length);
                return;
            }
            const progress = Math.min(1, Math.max(0, (viewTop - wrapperTop) / scrollable));
            setCount(THRESHOLDS.filter((t) => progress >= t).length);
        };

        wrapper
            .closest('ion-content')
            ?.getScrollElement()
            .then((el) => {
                if (cancelled) return;
                scrollEl = el;
                el.addEventListener('scroll', update, { passive: true });
                window.addEventListener('resize', update);
                update();
            });

        return () => {
            cancelled = true;
            scrollEl?.removeEventListener('scroll', update);
            window.removeEventListener('resize', update);
        };
    }, []);

    return (
        <section ref={wrapperRef} className="purpose" aria-labelledby="purpose-title">
            <div className="purpose__sticky" style={{ backgroundImage: `url(${clouds})` }}>
                <div className="purpose__inner">
                    <div className="purpose__content">
                        <p className="purpose__eyebrow">Nuestro propósito</p>
                        <h2 id="purpose-title" className="purpose__title">
                            Más que encontrar un <span>nuevo hogar</span>
                        </h2>

                        <ol
                            className="purpose__steps"
                            style={{ '--count': count, '--total': purposeSteps.length } as CSSProperties}
                        >
                            {purposeSteps.map((step, index) => (
                                <li
                                    key={step.number}
                                    className={`purpose-step${index < count ? ' is-visible' : ''}`}
                                >
                                    <div className="purpose-step__head">
                                        <span className="purpose-step__number">{step.number}</span>
                                        <h3 className="purpose-step__title">{step.title}</h3>
                                    </div>
                                    <p className="purpose-step__text">{step.text}</p>
                                </li>
                            ))}
                        </ol>
                    </div>

                    <figure className="purpose__figure">
                        <img
                            src={purposeImage}
                            alt="Un gato y un cachorro de perro juntos"
                            className="purpose__image"
                        />
                    </figure>
                </div>
            </div>
        </section>
    );
}