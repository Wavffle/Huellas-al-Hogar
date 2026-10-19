import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import {
    arrowForward,
    calendarOutline,
    chevronBack,
    heart,
    heartOutline,
    homeOutline,
    locationOutline,
    pawOutline,
    personOutline,
} from 'ionicons/icons';
import { getAnimales, getAnimalPorId } from '../services/animalService';
import PawLoader from '../components/common/PawLoader';
import AdoptionGallery from '../components/adoptions/AdoptionGallery';
import AdoptionCard from '../components/adoptions/AdoptionCard';
import { mapAnimal } from '../components/adoptions/adoptionMapper';
import {
    capitalize,
    conviveText,
    healthText,
    idealText,
    mapAnimalDetail,
    originLabel,
    statusLabel,
    sterilizedLabel,
    type AnimalDetail,
} from '../components/adoptions/adoptionDetail';
import { SPECIES_LABEL, formatAge } from '../components/adoptions/adoptionUtils';
import type { AdoptionAnimal } from '../components/data/adoptions';
import iconRegla from '../assets/icons/detalle-regla.svg';
import iconSexo from '../assets/icons/detalle-sexo.svg';
import iconSalud from '../assets/icons/detalle-salud.svg';
import iconCruz from '../assets/icons/detalle-cruz.svg';
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

            <div className="det-layout">
                <div className="det-gallery-area">
                    <AdoptionGallery key={animal.id} photos={animal.photos} name={animal.name} />
                </div>

                <div className="det-info">
                    <span className="det-badge">{statusLabel(animal.status)}</span>

                    <ul className="det-meta">
                        <li>
                            <IonIcon icon={calendarOutline} aria-hidden="true" />
                            {formatAge(animal.ageMonths)}
                        </li>
                        <li>
                            <img src={iconSexo} alt="" />
                            {capitalize(animal.sex)}
                        </li>
                        <li>
                            <img src={iconRegla} alt="" />
                            {capitalize(animal.size)}
                        </li>
                    </ul>

                    <h1 className="det-name">{animal.name}</h1>

                    <p className="det-city">
                        <IonIcon icon={locationOutline} aria-hidden="true" />
                        {animal.city}
                    </p>

                    <ul className="det-tiles">
                        <li className="det-tile">
                            <IonIcon icon={pawOutline} aria-hidden="true" />
                            <span className="det-tile__label">Especie</span>
                            <strong>{SPECIES_LABEL[animal.species]}</strong>
                        </li>
                        <li className="det-tile">
                            <img src={iconSalud} alt="" />
                            <span className="det-tile__label">Salud</span>
                            <strong>{sterilizedLabel(animal)}</strong>
                        </li>
                        <li className="det-tile">
                            <IonIcon icon={homeOutline} aria-hidden="true" />
                            <span className="det-tile__label">Origen</span>
                            <strong>{originLabel(animal.origin)}</strong>
                        </li>
                    </ul>

                    <Link to={`/adopciones/${animal.id}/solicitar`} className="det-button">
                        <IonIcon icon={heart} aria-hidden="true" />
                        Solicitar adopción
                    </Link>

                    {animal.tags.length > 0 && (
                        <ul className="det-tags">
                            {animal.tags.map((tag) => (
                                <li key={tag}>{tag}</li>
                            ))}
                        </ul>
                    )}
                </div>

                <section className="det-about" aria-labelledby="det-about-title">
                    <h2 id="det-about-title" className="det-heading">
                        Sobre {animal.name}
                    </h2>
                    <p className="det-about__text selectable">
                        {animal.description || 'Aún no hay una descripción para este animal.'}
                    </p>
                </section>

                <section className="det-extra" aria-labelledby="det-extra-title">
                    <h2 id="det-extra-title" className="det-heading">
                        Información adicional
                    </h2>
                    <dl className="det-extra__list selectable">
                        <div className="det-extra__row">
                            <dt>
                                <img src={iconCruz} alt="" />
                                Salud
                            </dt>
                            <dd>{healthText(animal)}</dd>
                        </div>
                        <div className="det-extra__row">
                            <dt>
                                <IonIcon icon={heartOutline} aria-hidden="true" />
                                Convivencia
                            </dt>
                            <dd>{conviveText(animal)}</dd>
                        </div>
                        <div className="det-extra__row">
                            <dt>
                                <IonIcon icon={personOutline} aria-hidden="true" />
                                Ideal para
                            </dt>
                            <dd>{idealText(animal)}</dd>
                        </div>
                    </dl>
                </section>
            </div>

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