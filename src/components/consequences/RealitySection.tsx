import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import './RealitySection.css';

type Mode = 'idle' | 'locked' | 'moving' | 'done';

/* ===== Ajustes de la animación ===== */
// El bloqueo solo se usa en escritorio con mouse. En móvil / táctil el texto igual
// aparece, pero la página no se detiene.
const DESKTOP_MOUSE = '(min-width: 800px) and (hover: hover) and (pointer: fine)';
// El texto empieza a aparecer cuando el borde superior de la sección llega a este % de la
// altura de la pantalla (0.55 = cuando el texto asoma por abajo). Más alto = aparece antes.
const REVEAL_TRIGGER = 0.55;
const WORD_DELAY_MS = 35;     // desfase entre una palabra y la siguiente
const WORD_DURATION_MS = 800; // cuánto tarda cada palabra en aparecer
const SNAP_MS = 450;          // cuánto tarda en acomodar la sección para que use toda la pantalla
const MOVE_MS = 1000;         // cuánto dura el desplazamiento automático hacia las tarjetas
const LOCK_MIN_MS = 500;      // tiempo mínimo detenido antes de aceptar el siguiente giro
const GESTURE_GAP_MS = 180;   // giros de rueda más seguidos que esto cuentan como uno solo (inercia)

const LOCK_SHIFT_PX = 0; // dónde queda "Es una realidad..." cuando la página se detiene
const MOVE_SHIFT_PX = -80; // dónde quedan las tarjetas después de bajar solas

const STRONG_TEXT = 'Es una realidad que nos afecta a todos.';
const REST_TEXT =
    'El abandono no solo cambia la vida de un animal, también impacta en nuestras ciudades, en la convivencia y en los recursos destinados a su cuidado.';

const strongWords = STRONG_TEXT.split(' ');
const restWords = REST_TEXT.split(' ');
const TOTAL = strongWords.length + restWords.length + 1;
const REVEAL_TOTAL_MS = (TOTAL - 1) * WORD_DELAY_MS + WORD_DURATION_MS;

export default function RealitySection() {
    const sectionRef = useRef<HTMLElement>(null);
    const [lockable, setLockable] = useState(() => window.matchMedia(DESKTOP_MOUSE).matches);
    const [revealed, setRevealed] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia(DESKTOP_MOUSE);
        const onChange = () => setLockable(mq.matches);
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, []);

    useEffect(() => {
        const section = sectionRef.current;
        const content = section?.closest('ion-content') as HTMLIonContentElement | null;
        if (!section || !content) return;

        const s = {
            mode: (lockable ? 'idle' : 'done') as Mode,
            revealed: false,
            revealedAt: 0,
            snapping: false,
            lockedTop: 0,
            lockedAt: 0,
            lastWheel: 0,
            lastScrollTop: 0,
        };
        let scrollEl: HTMLElement | null = null;
        let cancelled = false;

        // Posición de un elemento respecto al borde superior del área con scroll
        const topOf = (el: HTMLElement) =>
            el.getBoundingClientRect().top - (scrollEl ? scrollEl.getBoundingClientRect().top : 0);

        /* --- El texto aparece solo, con su propio tiempo, apenas llegas a la sección --- */
        const checkReveal = () => {
            if (s.revealed || !scrollEl) return;
            if (topOf(section) > scrollEl.clientHeight * REVEAL_TRIGGER) return;
            s.revealed = true;
            s.revealedAt = performance.now();
            setRevealed(true);
        };

        // ¿Ya pasó el tiempo mínimo para aceptar el siguiente giro?
        const canAdvance = () => {
            const now = performance.now();
            return now - s.lockedAt >= LOCK_MIN_MS && now - s.revealedAt >= REVEAL_TOTAL_MS;
        };

        /* --- Detener la página cuando la sección usa toda la pantalla --- */
        const lock = (targetTop: number) => {
            s.mode = 'locked';
            s.snapping = true;
            s.lockedTop = targetTop;
            content.scrollToPoint(0, targetTop, SNAP_MS).then(() => {
                if (cancelled || !scrollEl) return;
                s.snapping = false;
                s.lockedTop = scrollEl.scrollTop;
                s.lastScrollTop = scrollEl.scrollTop;
                s.lockedAt = performance.now();
            });
        };

        /* --- Siguiente giro: bajar solo hasta la sección de las tarjetas --- */
        const advance = () => {
            const next = section.nextElementSibling as HTMLElement | null;
            if (!next || !scrollEl) {
                s.mode = 'done';
                return;
            }
            s.mode = 'moving';
            const top = scrollEl.scrollTop + topOf(next) + MOVE_SHIFT_PX;
            content.scrollToPoint(0, top, MOVE_MS).then(() => {
                s.mode = 'done';
                s.lastScrollTop = scrollEl ? scrollEl.scrollTop : 0;
            });
        };

        const onScroll = () => {
            if (!scrollEl) return;
            checkReveal();
            const top = scrollEl.scrollTop;
            const goingDown = top > s.lastScrollTop;
            s.lastScrollTop = top;

            if (s.mode === 'locked') {
                // Si intentan moverse (p. ej. arrastrando la barra de scroll), se devuelve
                if (!s.snapping && Math.abs(top - s.lockedTop) > 1) scrollEl.scrollTop = s.lockedTop;
                return;
            }
            if (s.mode !== 'idle' || !goingDown) return;

            const rectTop = topOf(section);
            if (rectTop > 1) return; // la sección todavía no llena la pantalla
            if (rectTop > -scrollEl.clientHeight * 0.6) lock(top + rectTop + LOCK_SHIFT_PX);
            else s.mode = 'done'; // pasó de largo con un scroll muy fuerte: no se detiene
        };

        const onWheel = (e: WheelEvent) => {
            const now = performance.now();
            const gap = now - s.lastWheel;
            s.lastWheel = now;
            if ((s.mode !== 'locked' && s.mode !== 'moving') || e.ctrlKey) return;

            if (s.mode === 'moving') {
                e.preventDefault(); // mientras baja solo, se ignora la rueda
                return;
            }
            const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
            // Scroll hacia arriba: se libera y se sube normal
            if (dy < -4 && !s.snapping) {
                s.mode = 'idle';
                return;
            }
            e.preventDefault();
            if (s.snapping || gap < GESTURE_GAP_MS || dy < 4) return;
            if (!canAdvance()) return;
            advance();
        };

        // Teclado: abajo avanza, arriba libera, Fin salta la animación
        const onKey = (e: KeyboardEvent) => {
            if (s.mode !== 'locked' && s.mode !== 'moving') return;
            const tag = (e.target as HTMLElement | null)?.tagName ?? '';
            if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return;

            const up = ['ArrowUp', 'PageUp', 'Home'].includes(e.key) || (e.key === ' ' && e.shiftKey);
            const down = ['ArrowDown', 'PageDown'].includes(e.key) || (e.key === ' ' && !e.shiftKey);
            if (s.mode === 'moving') {
                if (up || down || e.key === 'End') e.preventDefault();
                return;
            }
            if (e.key === 'End') {
                s.mode = 'done';
            } else if (up) {
                s.mode = 'idle';
            } else if (down) {
                e.preventDefault();
                if (!e.repeat && !s.snapping && canAdvance()) advance();
            }
        };

        content.getScrollElement().then((el) => {
            if (cancelled) return;
            scrollEl = el;
            s.lastScrollTop = el.scrollTop;
            el.addEventListener('scroll', onScroll, { passive: true });
            if (lockable) {
                el.addEventListener('wheel', onWheel, { passive: false });
                document.addEventListener('keydown', onKey);
            }
            checkReveal(); // por si la sección ya está a la vista al cargar
        });

        return () => {
            cancelled = true;
            scrollEl?.removeEventListener('scroll', onScroll);
            scrollEl?.removeEventListener('wheel', onWheel);
            document.removeEventListener('keydown', onKey);
        };
    }, [lockable]);

    return (
        <section
            ref={sectionRef}
            className={`aban-reality${revealed ? ' is-revealed' : ''}`}
            aria-labelledby="aban-reality-question"
            style={
                {
                    '--word-delay': `${WORD_DELAY_MS}ms`,
                    '--word-duration': `${WORD_DURATION_MS}ms`,
                } as CSSProperties
            }
        >
            <div className="aban-reality__inner">
                <p className="aban-reality__lead selectable">
                    <strong>
                        {strongWords.map((word, index) => (
                            <span key={`s-${index}`}>
                                <span
                                    className="aban-reality__word aban-reality__reveal"
                                    style={{ '--i': index } as CSSProperties}
                                >
                                    {word}
                                </span>{' '}
                            </span>
                        ))}
                    </strong>
                    {restWords.map((word, index) => (
                        <span key={`r-${index}`}>
                            <span
                                className="aban-reality__word aban-reality__reveal"
                                style={{ '--i': strongWords.length + index } as CSSProperties}
                            >
                                {word}
                            </span>{' '}
                        </span>
                    ))}
                </p>

                <h2
                    id="aban-reality-question"
                    className="aban-reality__question aban-reality__reveal"
                    style={{ '--i': TOTAL - 1 } as CSSProperties}
                >
                    ¿Qué podemos hacer?
                </h2>
            </div>
        </section>
    );
}
