import { useState } from 'react';
import type { CSSProperties } from 'react';
import { IonIcon } from '@ionic/react';
import { chevronBack, chevronForward } from 'ionicons/icons';
import { animals } from '../data/animals';
import AnimalCard from './AnimalCard';
import './AnimalsCarousel.css';

const total = animals.length;
const half = Math.floor(total / 2);

/** Posición relativa al centro (…-2, -1, 0, 1, 2…) con vuelta circular. */
function getOffset(index: number, position: number) {
    return ((((index - position + half) % total) + total) % total) - half;
}

export default function AnimalsCarousel() {
    const start = Math.floor(total / 2);
    const [{ position, previous }, setState] = useState({ position: start, previous: start });

    const move = (direction: 1 | -1) =>
        setState((s) => ({ previous: s.position, position: s.position + direction }));

    if (total === 0) return null;

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
                        // Si una tarjeta "da la vuelta" de un extremo al otro, la movemos sin animación
                        const jumped = Math.abs(offset - getOffset(index, previous)) > 1;
                        const classes = [
                            'animals__slot',
                            offset === 0 && 'is-active',
                            jumped && 'is-jumping',
                            Math.abs(offset) > 2 && 'is-hidden',
                        ]
                            .filter(Boolean)
                            .join(' ');

                        return (
                            <li key={animal.id} className={classes} style={{ '--offset': offset } as CSSProperties}>
                                <AnimalCard animal={animal} />
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