import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { careCards } from '../data/education';
import './CareSection.css';

type Phase = 'hidden' | 'cards' | 'quote';

/* ===== Ajustes de la animación ===== */
const DESKTOP_MOUSE = '(min-width: 800px) and (hover: hover) and (pointer: fine)';
// Cuánto dura cada paso (ms).
const CARDS_ANIMATION_MS = 1700;
const QUOTE_ANIMATION_MS = 1000;
const SNAP_MS = 450;
// Dónde se detiene: el título queda este espacio (px) bajo el navbar.
const LOCK_TOP_GAP = 12;
// Giros de rueda separados por menos de esto se cuentan como un solo gesto
const GESTURE_GAP_MS = 180;

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
    const sectionRef = useRef<HTMLElement>(null);
    const headingRef = useRef<HTMLHeadingElement>(null);
    const [animated, setAnimated] = useState(() => window.matchMedia(DESKTOP_MOUSE).matches);
    const [phase, setPhase] = useState<Phase>('hidden');
    const phaseRef = useRef<Phase>(phase);
    phaseRef.current = phase;

    // Si la ventana cambia entre escritorio con mouse y otro modo
    useEffect(() => {
        const mq = window.matchMedia(DESKTOP_MOUSE);
        const onChange = () => setAnimated(mq.matches);
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, []);

    useEffect(() => {
        // Sin animación: visible
        if (!animated) {
            setPhase('quote');
            return;
        }
        // Ya se mostró antes: no volver a bloquear
        if (phaseRef.current !== 'hidden') return;

        const section = sectionRef.current;
        const content = section?.closest('ion-content') as HTMLIonContentElement | null;
        if (!section || !content) {
            setPhase('quote');
            return;
        }

        const s = {
            mode: 'idle' as 'idle' | 'locked' | 'done',
            step: 0,
            busy: false,
            snapping: false,
            lockedTop: 0,
            lastWheel: 0,
            lastScrollTop: 0,
        };
        let scrollEl: HTMLElement | null = null;
        let cancelled = false;
        const timers: number[] = [];
        const later = (fn: () => void, ms: number) => {
            timers.push(window.setTimeout(fn, ms));
        };

        // Línea bajo el navbar donde debe quedar el título al detenerse
        const lineY = () => {
            const nav = document.querySelector<HTMLElement>('.navbar');
            return (nav?.getBoundingClientRect().bottom ?? 0) + LOCK_TOP_GAP;
        };

        const revealAll = () => {
            s.mode = 'done';
            setPhase('quote');
        };

        // Paso 1: tarjetas. Paso 2: frase con el dibujo. Luego se libera el scroll.
        const advance = () => {
            if (s.busy) return;
            s.busy = true;
            if (s.step === 0) {
                s.step = 1;
                setPhase('cards');
                later(() => {
                    s.busy = false;
                }, CARDS_ANIMATION_MS);
            } else {
                s.step = 2;
                setPhase('quote');
                later(() => {
                    s.busy = false;
                    s.mode = 'done';
                }, QUOTE_ANIMATION_MS);
            }
        };

        const lock = (targetTop: number) => {
            s.mode = 'locked';
            s.step = 0;
            s.busy = false;
            s.snapping = true;
            s.lockedTop = targetTop;
            content.scrollToPoint(0, targetTop, SNAP_MS).then(() => {
                if (cancelled || !scrollEl) return;
                s.snapping = false;
                s.lockedTop = scrollEl.scrollTop;
                s.lastScrollTop = scrollEl.scrollTop;
            });
        };

        const onScroll = () => {
            if (!scrollEl) return;
            const top = scrollEl.scrollTop;
            const goingDown = top > s.lastScrollTop;
            s.lastScrollTop = top;

            if (s.mode === 'locked') {
                // Si intentan moverse (p. ej. arrastrando la barra de scroll), se devuelve
                if (!s.snapping && Math.abs(top - s.lockedTop) > 1) scrollEl.scrollTop = s.lockedTop;
                return;
            }
            if (s.mode === 'done') return;

            const heading = headingRef.current;
            if (!heading) return;
            const delta = heading.getBoundingClientRect().top - lineY();
            if (delta > 0) return; // todavía no llega a la línea

            if (goingDown && delta > -window.innerHeight * 0.6) lock(top + delta);
            else revealAll(); // llegó por otro camino (recarga, scroll hacia arriba...)
        };

        const onWheel = (e: WheelEvent) => {
            const now = performance.now();
            const gap = now - s.lastWheel;
            s.lastWheel = now;
            if (s.mode !== 'locked' || e.ctrlKey) return;

            const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
            // Scroll hacia arriba
            if (dy < -4 && !s.snapping) {
                revealAll();
                return;
            }
            e.preventDefault();
            if (s.snapping || s.busy || gap < GESTURE_GAP_MS || dy < 4) return;
            advance();
        };

        const onKey = (e: KeyboardEvent) => {
            if (s.mode !== 'locked') return;
            const tag = (e.target as HTMLElement | null)?.tagName ?? '';
            if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return;

            const up = ['ArrowUp', 'PageUp', 'Home', 'End'].includes(e.key) || (e.key === ' ' && e.shiftKey);
            const down = ['ArrowDown', 'PageDown'].includes(e.key) || (e.key === ' ' && !e.shiftKey);
            if (up) {
                revealAll();
            } else if (down) {
                e.preventDefault();
                if (!e.repeat && !s.snapping) advance();
            }
        };

        content.getScrollElement().then((el) => {
            if (cancelled) return;
            scrollEl = el;
            s.lastScrollTop = el.scrollTop;
            el.addEventListener('scroll', onScroll, { passive: true });
            el.addEventListener('wheel', onWheel, { passive: false });
            document.addEventListener('keydown', onKey);
            onScroll(); // por si la página ya cargó más abajo de la línea
        });

        return () => {
            cancelled = true;
            timers.forEach((t) => window.clearTimeout(t));
            scrollEl?.removeEventListener('scroll', onScroll);
            scrollEl?.removeEventListener('wheel', onWheel);
            document.removeEventListener('keydown', onKey);
        };
    }, [animated]);

    const className = [
        'care',
        animated ? 'care--animated' : '',
        phase !== 'hidden' ? 'is-cards' : '',
        phase === 'quote' ? 'is-quote' : '',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <section ref={sectionRef} className={className} aria-labelledby="care-title">
            <h2 ref={headingRef} id="care-title" className="care__heading">
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
                {careCards.map((card, index) => (
                    <li
                        key={card.title}
                        className={`care-card care-card--${card.tone}`}
                        style={{ '--i': index } as CSSProperties}
                    >
                        <img src={card.image} alt={card.alt} className="care-card__image" loading="lazy" />
                        <div className="care-card__body">
                            <h3 className="care-card__title">{card.title}</h3>
                            <p className="care-card__text selectable">{card.text}</p>
                        </div>
                    </li>
                ))}

                <li className="care__quote">
                    <p className="care__quote-text">
                        Pequeñas acciones, grandes <br />
                        cambios
                    </p>
                    <svg className="care__quote-art" viewBox="0 0 120 90" aria-hidden="true">
                        <path
                            d="M12 21C12 21 3 15.5 3 8.8C3 5.6 5.4 3.5 8 3.5C9.7 3.5 11.2 4.4 12 5.8C12.8 4.4 14.3 3.5 16 3.5C18.6 3.5 21 5.6 21 8.8C21 15.5 12 21 12 21Z"
                            transform="translate(66 2) scale(2.3) rotate(22 12 12)"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.4"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                        />
                        <path
                            d="M4 58C10 80 38 90 60 78C72 71 80 62 84 54"
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
