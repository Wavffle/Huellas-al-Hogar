import { useState } from 'react';
import type { CSSProperties } from 'react';
import { IonIcon } from '@ionic/react';
import { chevronBack, chevronForward } from 'ionicons/icons';
import './AdoptionGallery.css';

export default function AdoptionGallery({ photos, name }: { photos: string[]; name: string }) {
    const [index, setIndex] = useState(0);

    if (photos.length === 0) {
        return <div className="det-gallery__empty">Sin fotos por ahora</div>;
    }

    const go = (next: number) => setIndex((next + photos.length) % photos.length);

    return (
        <div className="det-gallery">
            <div className="det-gallery__main">
                <img src={photos[index]} alt={`Foto ${index + 1} de ${name}`} className="det-gallery__image" />
                {photos.length > 1 && (
                    <>
                        <button
                            type="button"
                            className="det-gallery__arrow det-gallery__arrow--prev"
                            aria-label="Foto anterior"
                            onClick={() => go(index - 1)}
                        >
                            <IonIcon icon={chevronBack} aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            className="det-gallery__arrow det-gallery__arrow--next"
                            aria-label="Foto siguiente"
                            onClick={() => go(index + 1)}
                        >
                            <IonIcon icon={chevronForward} aria-hidden="true" />
                        </button>
                    </>
                )}
            </div>

            {photos.length > 1 && (
                <ul
                    className="det-gallery__thumbs"
                    style={{ '--count': photos.length, '--index': index } as CSSProperties}
                >
                    {photos.map((photo, i) => (
                        <li key={photo} className="det-gallery__thumb-item">
                            <button
                                type="button"
                                className="det-gallery__thumb"
                                aria-label={`Ver foto ${i + 1}`}
                                aria-current={i === index}
                                onClick={() => setIndex(i)}
                            >
                                <img src={photo} alt="" />
                            </button>
                        </li>
                    ))}
                    {/* Borde que se desliza hasta la miniatura activa */}
                    <li className="det-gallery__indicator" aria-hidden="true" />
                </ul>
            )}
        </div>
    );
}