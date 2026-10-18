import { IonIcon } from '@ionic/react';
import { arrowForwardCircleOutline, locationOutline } from 'ionicons/icons';
import { Link } from 'react-router-dom';
import type { AdoptionAnimal } from '../data/adoptions';
import { SPECIES_LABEL, formatAge } from './adoptionUtils';
import './AdoptionCard.css';

export default function AdoptionCard({ animal }: { animal: AdoptionAnimal }) {
    return (
        <Link to={`/adopciones/${animal.id}`} className="adop-card">
            <div className="adop-card__media">
                <img src={animal.image} alt={`Foto de ${animal.name}`} className="adop-card__image" />
                <span className="adop-card__tag">{SPECIES_LABEL[animal.species]}</span>
            </div>
            <div className="adop-card__body">
                <h3 className="adop-card__name">{animal.name}</h3>
                <span className="adop-card__age">{formatAge(animal.ageMonths)}</span>
                <span className="adop-card__city">
                    <IonIcon icon={locationOutline} aria-hidden="true" />
                    <span>{animal.city}</span>
                </span>
                <span className="adop-card__more">
                    <IonIcon icon={arrowForwardCircleOutline} className="adop-card__arrow" aria-hidden="true" />
                    <span className="adop-card__tooltip" aria-hidden="true">
                        Ver más información
                    </span>
                </span>
            </div>
        </Link>
    );
}