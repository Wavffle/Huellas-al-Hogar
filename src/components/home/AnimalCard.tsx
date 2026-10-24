import { Link } from 'react-router-dom';
import type { Animal } from '../../types/animal';
import { resolveImage } from '../adoptions/adoptionMapper';
import './AnimalCard.css';

const MAX_TAGS = 6;

export default function AnimalCard({ animal }: { animal: Animal }) {
    const imagenUrl = resolveImage(animal.imagen_portada ?? '') || 'https://via.placeholder.com/243x89?text=Sin+foto';
    const etiquetas = (animal.etiquetas ?? []).slice(0, MAX_TAGS);

    return (
        <article className="animal-card">
            <img src={imagenUrl} alt={`Foto de ${animal.nombre}`} className="animal-card__image" />
            <div className="animal-card__body">
                <h3 className="animal-card__name">{animal.nombre}</h3>
                <p className="animal-card__age">
                    {animal.edad ? `${animal.edad} años` : animal.edad_meses ? `${animal.edad_meses} meses` : 'Edad desconocida'}
                </p>
                {etiquetas.length > 0 && (
                    <ul className="animal-card__tags" aria-label="Características">
                        {etiquetas.map((tag) => (
                            <li key={tag}>{tag}</li>
                        ))}
                    </ul>
                )}
                <Link to={`/adopciones/${animal.id}`} className="animal-card__button">
                    Más información
                </Link>
            </div>
        </article>
    );
}