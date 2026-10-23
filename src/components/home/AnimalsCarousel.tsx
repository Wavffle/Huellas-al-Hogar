import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { IonIcon, IonSpinner } from '@ionic/react';
import { chevronBack, chevronForward } from 'ionicons/icons';
import { Animal } from '../../types/animal';
import { getAnimales } from '../../services/animalService';
import AnimalCard from './AnimalCard';
import './AnimalsCarousel.css';

const DESKTOP_QUERY = '(min-width: 700px)';
const MAX_CLICKABLE = 3;

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
    const [animalsList, setAnimalsList] = useState<Animal[]>([]);
    const [cargando, setCargando] = useState(true);

    // Inicializamos en 0 en lugar de 2 por si hay poquitos animales en la BD
    const [{ position, previous, moves }, setState] = useState({
        position: 0,
        previous: 0,
        moves: 0,
    });

    const isDesktop = useIsDesktop();

    // 1. Cargamos los animales desde tu backend
    useEffect(() => {
        getAnimales()
            .then((data) => {
                // Extraemos la lista real, sin importar si viene suelta o dentro de 'data'
                const listaReal = Array.isArray(data) ? data : data?.data ?? [];
                setAnimalsList(listaReal);
                setCargando(false);
            })
            .catch((err) => {
                console.error("Error al cargar carrusel:", err);
                setCargando(false);
            });
    }, []);

    // 2. Las fórmulas matemáticas ahora viven adentro y usan el listado real
    const total = animalsList.length;
    const half = Math.floor(total / 2);

    function getOffset(index: number, pos: number) {
        if (total === 0) return 0;
        return ((((index - pos + half) % total) + total) % total) - half;
    }

    const move = (steps: number) =>
        setState((s) => ({ previous: s.position, position: s.position + steps, moves: s.moves + 1 }));

    if (cargando) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
                <IonSpinner name="crescent" />
                <p>Cargando a los peludos...</p>
            </div>
        );
    }

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
                    {animalsList.map((animal, index) => {
                        const offset = getOffset(index, position);
                        const distance = Math.abs(offset);
                        const jumped = offset - getOffset(index, previous) !== -delta;
                        const isActive = offset === 0;
                        const isClickable = isDesktop && !isActive && distance <= MAX_CLICKABLE;
                        const classes = [
                            'animals__slot',
                            isActive && 'is-active',
                            jumped && `is-jumping-${moves % 2}`,
                            distance > 4 && 'is-hidden',
                        ]
                            .filter(Boolean)
                            .join(' ');

                        const lockCard = isDesktop && !isActive;

                        return (
                            <li
                                key={animal.id}
                                className={classes}
                                style={
                                    {
                                        '--offset': offset,
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
                                        aria-label={`Ver a ${animal.nombre}`}
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
