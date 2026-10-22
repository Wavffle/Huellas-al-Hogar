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
import AdoptionGallery from '../adoptions/AdoptionGallery';
import {
    capitalize,
    conviveText,
    healthText,
    idealText,
    originLabel,
    statusLabel,
    sterilizedLabel,
    type AnimalDetail,
} from '../adoptions/adoptionDetail';
import { SPECIES_LABEL, formatAge } from '../adoptions/adoptionUtils';
import iconRegla from '../../assets/icons/detalle-regla.svg';
import iconSexo from '../../assets/icons/detalle-sexo.svg';
import iconSalud from '../../assets/icons/detalle-salud.svg';
import iconCruz from '../../assets/icons/detalle-cruz.svg';
import './PublishPreview.css';

/** Versión reducida de la página de detalle, con los datos del formulario. */
export default function PublishPreview({ animal }: { animal: AnimalDetail }) {
    return (
        <section className="pub-prev" aria-labelledby="pub-prev-title">
            <h3 id="pub-prev-title" className="pub-prev__title">
                Vista previa del perfil
            </h3>

            <div className="pub-prev__layout">
                <div className="pub-prev__gallery">
                    <AdoptionGallery key={animal.photos.join('|')} photos={animal.photos} name={animal.name} />
                </div>

                <div className="pub-prev__info">
                    <span className="pub-prev__badge">{statusLabel(animal.status)}</span>

                    <ul className="pub-prev__meta">
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

                    <h4 className="pub-prev__name">{animal.name}</h4>

                    <p className="pub-prev__city">
                        <IonIcon icon={locationOutline} aria-hidden="true" />
                        {animal.city}
                    </p>

                    <ul className="pub-prev__tiles">
                        <li className="pub-prev__tile">
                            <IonIcon icon={pawOutline} aria-hidden="true" />
                            <span className="pub-prev__tile-label">Especie</span>
                            <strong>{SPECIES_LABEL[animal.species]}</strong>
                        </li>
                        <li className="pub-prev__tile">
                            <img src={iconSalud} alt="" />
                            <span className="pub-prev__tile-label">Salud</span>
                            <strong>{sterilizedLabel(animal)}</strong>
                        </li>
                        <li className="pub-prev__tile">
                            <IonIcon icon={homeOutline} aria-hidden="true" />
                            <span className="pub-prev__tile-label">Origen</span>
                            <strong>{originLabel(animal.origin)}</strong>
                        </li>
                    </ul>

                    <span className="pub-prev__button">
                        <IonIcon icon={heart} aria-hidden="true" />
                        Solicitar adopción
                    </span>

                    {animal.tags.length > 0 && (
                        <ul className="pub-prev__tags">
                            {animal.tags.map((tag) => (
                                <li key={tag}>{tag}</li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="pub-prev__about">
                    <h4 className="pub-prev__heading">Sobre {animal.name}</h4>
                    <p className="pub-prev__text selectable">{animal.description}</p>
                </div>

                <div className="pub-prev__extra">
                    <h4 className="pub-prev__heading">Información adicional</h4>
                    <dl className="pub-prev__list selectable">
                        <div className="pub-prev__row">
                            <dt>
                                <img src={iconCruz} alt="" />
                                Salud
                            </dt>
                            <dd>{healthText(animal)}</dd>
                        </div>
                        <div className="pub-prev__row">
                            <dt>
                                <IonIcon icon={heartOutline} aria-hidden="true" />
                                Convivencia
                            </dt>
                            <dd>{conviveText(animal)}</dd>
                        </div>
                        <div className="pub-prev__row">
                            <dt>
                                <IonIcon icon={personOutline} aria-hidden="true" />
                                Ideal para
                            </dt>
                            <dd>{idealText(animal)}</dd>
                        </div>
                    </dl>
                </div>
            </div>
        </section>
    );
}
