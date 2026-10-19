import { Link } from 'react-router-dom';
import './AnimalCard.css';

export interface HomeAnimal {
    id: string;
    name: string;
    age: string;
    description: string;
    image: string;
}

export default function AnimalCard({ animal }: { animal: HomeAnimal }) {
    return (
        <article className="animal-card">
            <img src={animal.image} alt={`Foto de ${animal.name}`} className="animal-card__image" />
            <div className="animal-card__body">
                <h3 className="animal-card__name">{animal.name}</h3>
                <p className="animal-card__age">{animal.age}</p>
                {animal.description && <p className="animal-card__description">{animal.description}</p>}
                <Link to={`/adopciones/${animal.id}`} className="animal-card__button">
                    Más información
                </Link>
            </div>
        </article>
    );
}