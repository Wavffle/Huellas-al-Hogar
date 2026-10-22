import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import { arrowForward, chevronBack } from 'ionicons/icons';
import { getAnimales, getAnimalPorId } from '../services/animalService';
import PawLoader from '../components/common/PawLoader';
import AnimalProfile from '../components/adoptions/AnimalProfile';
import AdoptionCard from '../components/adoptions/AdoptionCard';
import { mapAnimal } from '../components/adoptions/adoptionMapper';
import { mapAnimalDetail, type AnimalDetail } from '../components/adoptions/adoptionDetail';
import type { AdoptionAnimal } from '../data/adoptions';
import './AdoptionDetailPage.css';

const MORE_COUNT = 6;

export default function AdoptionDetailPage() {
    const { animalId } = useParams<{ animalId: string }>();
    const [animal, setAnimal] = useState<AnimalDetail | null>(null);
    const [others, setOthers] = useState<AdoptionAnimal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<'notfound' | 'failed' | null>(null);
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);

        getAnimalPorId(animalId)
            .then((response) => {
                if (cancelled) return;
                setAnimal(mapAnimalDetail(response?.data ?? response));
            })
            .catch((err) => {
                if (cancelled) return;
                console.error('Error al cargar el animal:', err);
                setError(err?.response?.status === 404 ? 'notfound' : 'failed');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        // "Más animales": si falla, simplemente no se muestra la sección
        getAnimales()
            .then((response) => {
                if (cancelled) return;
                const list = Array.isArray(response) ? response : response?.data ?? [];
                setOthers(
                    list
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        .filter((a: any) => String(a.id) !== animalId && (!a.estado || a.estado === 'EN_ADOPCION'))
                        .slice(0, MORE_COUNT)
                        .map(mapAnimal),
                );
            })
            .catch(() => {
                if (!cancelled) setOthers([]);
            });

        return () => {
            cancelled = true;
        };
    }, [animalId, attempt]);

    if (loading) {
        return (
            <div className="det-page det-page--center">
                <PawLoader label="Cargando…" />
            </div>
        );
    }

    if (error || !animal) {
        return (
            <div className="det-page det-page--center">
                <p>
                    {error === 'notfound'
                        ? 'No encontramos a este animal.'
                        : 'No se pudo cargar la información del animal.'}
                </p>
                {error === 'failed' && (
                    <button type="button" className="det-button det-button--small" onClick={() => setAttempt((n) => n + 1)}>
                        Reintentar
                    </button>
                )}
                <Link to="/adopciones" className="det-back">
                    <IonIcon icon={chevronBack} aria-hidden="true" /> Volver a adopciones
                </Link>
            </div>
        );
    }

    return (
        <div className="det-page">
            <Link to="/adopciones" className="det-back">
                <IonIcon icon={chevronBack} aria-hidden="true" />
                Volver a adopciones
            </Link>

            <AnimalProfile animal={animal} />

            {others.length > 0 && (
                <section className="det-more" aria-labelledby="det-more-title">
                    <div className="det-more__head">
                        <h2 id="det-more-title" className="det-more__title">
                            Más animales buscan tu ayuda
                        </h2>
                        <Link to="/adopciones" className="det-more__link det-more__link--top">
                            Ver más animales <IonIcon icon={arrowForward} aria-hidden="true" />
                        </Link>
                    </div>

                    <ul className="det-more__grid">
                        {others.map((other) => (
                            <li key={other.id}>
                                <AdoptionCard animal={other} />
                            </li>
                        ))}
                    </ul>

                    <Link to="/adopciones" className="det-more__link det-more__link--bottom">
                        Ver más animales <IonIcon icon={arrowForward} aria-hidden="true" />
                    </Link>
                </section>
            )}
        </div>
    );
}