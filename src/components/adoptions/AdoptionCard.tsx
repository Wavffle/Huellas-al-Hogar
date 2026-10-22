import { IonIcon } from '@ionic/react';
import { arrowForwardCircleOutline, locationOutline } from 'ionicons/icons';
import { Link } from 'react-router-dom';
import { SPECIES_LABEL, formatAge } from './adoptionUtils';
import './AdoptionCard.css';

export default function AdoptionCard({ animal }: { animal: any }) {
    // 1. Fusión de datos: Extraemos tus campos de PostgreSQL (o los del mapper de tu compa)
    const id = animal.id || animal.id_animal;
    const nombre = animal.nombre || animal.name;
    const ciudad = animal.ciudad || animal.city;
    const edadMeses = animal.edad_meses !== undefined ? animal.edad_meses : animal.ageMonths;
    const especie = String(animal.especie || animal.species || 'perro').toLowerCase() as keyof typeof SPECIES_LABEL;

    // 2. Lógica de imagen: Conectamos la foto al backend si viene cruda desde la BD
    let imagenUrl = animal.image;
    if (animal.foto_url) {
        imagenUrl = animal.foto_url.startsWith('http') 
            ? animal.foto_url 
            : `http://localhost:3000${animal.foto_url}`;
    }

    return (
        <Link to={`/adopciones/${id}`} className="adop-card">
            <div className="adop-card__media">
                <img src={imagenUrl} alt={`Foto de ${nombre}`} className="adop-card__image" />
                <span className="adop-card__tag">{SPECIES_LABEL[especie] || 'Mascota'}</span>
            </div>
            <div className="adop-card__body">
                <h3 className="adop-card__name">{nombre}</h3>
                <span className="adop-card__age">{formatAge(edadMeses)}</span>
                <span className="adop-card__city">
                    <IonIcon icon={locationOutline} aria-hidden="true" />
                    <span>{ciudad}</span>
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
