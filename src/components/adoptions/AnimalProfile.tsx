import type { ElementType } from 'react';
import { Link } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import {
    calendarOutline,
    heart,
    heartOutline,
    homeOutline,
    locationOutline,
    pawOutline,
    personOutline,
} from 'ionicons/icons';
import AdoptionGallery from './AdoptionGallery';
import {
    capitalize,
    conviveText,
    healthText,
    idealText,
    originLabel,
    statusLabel,
    sterilizedLabel,
    type AnimalDetail,
} from './adoptionDetail';
import { SPECIES_LABEL, formatAge } from './adoptionUtils';
import iconRegla from '../../assets/icons/detalle-regla.svg';
import iconSexo from '../../assets/icons/detalle-sexo.svg';
import iconSalud from '../../assets/icons/detalle-salud.svg';
import iconCruz from '../../assets/icons/detalle-cruz.svg';
import '../../pages/AdoptionDetailPage.css';

interface Props {
    animal: AnimalDetail;
    /** Vista previa (paso 5 de publicar): el botón no es un enlace y los títulos bajan de nivel. */
    preview?: boolean;
}

/** Ficha completa del animal. La usan el detalle de adopción y la vista previa de publicar. */
export default function AnimalProfile({ animal, preview = false }: Props) {
    const Name: ElementType = preview ? 'h4' : 'h1';
    const Heading: ElementType = preview ? 'h4' : 'h2';

    return (
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

                <Name className="det-name">{animal.name}</Name>

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

                {preview ? (
                    <span className="det-button" aria-disabled="true">
                        <IonIcon icon={heart} aria-hidden="true" />
                        Solicitar adopción
                    </span>
                ) : (
                    <Link to={`/adopciones/${animal.id}/solicitar`} className="det-button">
                        <IonIcon icon={heart} aria-hidden="true" />
                        Solicitar adopción
                    </Link>
                )}

                {animal.tags.length > 0 && (
                    <ul className="det-tags">
                        {animal.tags.map((tag) => (
                            <li key={tag}>{tag}</li>
                        ))}
                    </ul>
                )}
            </div>

            <section className="det-about" aria-labelledby="det-about-title">
                <Heading id="det-about-title" className="det-heading">
                    Sobre {animal.name}
                </Heading>
                <p className="det-about__text selectable">
                    {animal.description || 'Aún no hay una descripción para este animal.'}
                </p>
            </section>

            <section className="det-extra" aria-labelledby="det-extra-title">
                <Heading id="det-extra-title" className="det-heading">
                    Información adicional
                </Heading>
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
    );
}