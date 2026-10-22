import { Link } from 'react-router-dom';
import type { Animal } from '../../types/animals';
import './AnimalCard.css';

export default function AnimalCard({ animal }: { animal: Animal }) {
    // localhost:3000 para que el navegador vaya al backend a buscar la foto
    const imagenUrl = animal.imagen_portada 
        ? `http://localhost:3000${animal.imagen_portada}` 
        : 'https://via.placeholder.com/243x89?text=Sin+foto';

    return (
        <article className="animal-card">
            <img src={imagenUrl} alt={`Foto de ${animal.nombre}`} className="animal-card__image" />
            <div className="animal-card__body">
                <h3 className="animal-card__name">{animal.nombre}</h3>
                <p className="animal-card__age">
                    {animal.edad ? `${animal.edad} años` : animal.edad_meses ? `${animal.edad_meses} meses` : 'Edad desconocida'}
                </p>
                <p className="animal-card__description">{animal.descripcion}</p>
                <Link to={`/adopciones/${animal.id}`} className="animal-card__button">
                    Más información
                </Link>
            </div>
        </article>
    );
}
