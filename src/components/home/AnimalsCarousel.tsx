import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { IonIcon } from '@ionic/react';
import { chevronBack, chevronForward } from 'ionicons/icons';
import { animals } from '../data/animals';
import AnimalCard from './AnimalCard';
import './AnimalsCarousel.css';

const total = animals.length;
const half = Math.floor(total / 2);
const DESKTOP_QUERY = '(min-width: 700px)';
const MAX_CLICKABLE = 3; // hasta qué distancia del centro se puede hacer click

/** Posición relativa al centro (…-2, -1, 0, 1, 2…) con vuelta circular. */
function getOffset(index: number, position: number) {
    return ((((index - position + half) % total) + total) % total) - half;
}

/** true cuando el carrusel se muestra en modo escritorio (tarjeta central). */
function useIsDesktop() {
    const [isDesktop, setIsDesktop] = useState(() => window.matchMedia(DESKTOP_QUERY).matches);

    useEffect(() => {
        const mql = window.matchMedia(DESKTOP_QUERY);
        const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
        mql.addEventListener('change', onChange);
        return () => mql.removeEventListener('change', onChange);
    }, []);

    return isDesktop;
}

export default function AnimalsCarousel() {
    const start = 2; // Luna queda al centro, como en el mockup
    const [{ position, previous, moves }, setState] = useState({
        position: start,
        previous: start,
        moves: 0,
    });
    const isDesktop = useIsDesktop();

    /** Mueve el carrusel `steps` posiciones (positivo = derecha, negativo = izquierda). */
    const move = (steps: number) =>
        setState((s) => ({ previous: s.position, position: s.position + steps, moves: s.moves + 1 }));

    if (total === 0) return null;

    const delta = position - previous;

    return (
        <section className="animals" aria-labelledby="animals-title">
            <h2 id="animals-title" className="animals__title">
                <span>Animales</span> que buscan hogar
            </h2>

            <div className="animals__stage">
                <button
                    type="button"
                    className="animals__arrow animals__arrow--prev"
                    onClick={() => move(-1)}
                    aria-label="Animal anterior"
                >
                    <IonIcon icon={chevronBack} aria-hidden="true" />
                </button>

                <ul className="animals__track">
                    {animals.map((animal, index) => {
                        const offset = getOffset(index, position);
                        const distance = Math.abs(offset);
                        // Una tarjeta "da la vuelta" si no se movió lo esperado (-delta)
                        const jumped = offset - getOffset(index, previous) !== -delta;
                        const isActive = offset === 0;
                        const isClickable = isDesktop && !isActive && distance <= MAX_CLICKABLE;
                        const classes = [
                            'animals__slot',
                            isActive && 'is-active',
                            // Alternamos 0/1 para que la animación de aparición se reinicie en cada movimiento
                            jumped && `is-jumping-${moves % 2}`,
                            distance > 4 && 'is-hidden',
                        ]
                            .filter(Boolean)
                            .join(' ');

                        // En escritorio, solo la tarjeta central es interactiva
                        const lockCard = isDesktop && !isActive;

                        return (
                            <li
                                key={animal.id}
                                className={classes}
                                style={
                                    {
                                        '--offset': offset,
                                        // 0 para el centro y las vecinas, luego 1, 2, 3 (más lejos = más difuminada)
                                        '--blur': Math.max(0, distance - 2),
                                    } as CSSProperties
                                }
                            >
                                <div
                                    className="animals__card-wrap"
                                    {...(lockCard ? ({ inert: '' } as object) : {})}
                                >
                                    <AnimalCard animal={animal} />
                                </div>

                                {isClickable && (
                                    <button
                                        type="button"
                                        className="animals__select"
                                        onClick={() => move(offset)}
                                        aria-label={`Ver a ${animal.name}`}
                                    />
                                )}
                            </li>
                        );
                    })}
                </ul>

                <button
                    type="button"
                    className="animals__arrow animals__arrow--next"
                    onClick={() => move(1)}
                    aria-label="Siguiente animal"
                >
                    <IonIcon icon={chevronForward} aria-hidden="true" />
                </button>
            </div>
        </section>
    );
}