import { Link } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import { arrowForward } from 'ionicons/icons';
import personas from '../../assets/images/publicar/adopcion-segura-personas.webp';
import bienestar from '../../assets/images/publicar/adopcion-segura-bienestar.webp';
import comunidad from '../../assets/images/publicar/adopcion-segura-comunidad.webp';
import './PublishTrust.css';

const ITEMS = [
    {
        image: personas,
        title: 'Personas comprometidas',
        text: 'La información que entregues ayuda a encontrar una familia realmente interesada y preparada.',
    },
    {
        image: bienestar,
        title: 'Bienestar del animal',
        text: 'Sé transparente sobre sus necesidades de salud, comportamiento y entorno ideal.',
    },
    {
        image: comunidad,
        title: 'Comunidad confiable',
        text: 'Juntos construimos una comunidad más segura para todos los animales en adopción.',
    },
];

export default function PublishTrust() {
    return (
        <section className="pub-trust" aria-labelledby="pub-trust-title">
            <h2 id="pub-trust-title" className="pub-trust__title">
                <Link to="/educacion">
                    Para una adopción segura y responsable <IonIcon icon={arrowForward} aria-hidden="true" />
                </Link>
            </h2>

            <ul className="pub-trust__list">
                {ITEMS.map((item) => (
                    <li key={item.title} className="pub-trust__item">
                        <img src={item.image} alt="" className="pub-trust__image" />
                        <h3 className="pub-trust__name">{item.title}</h3>
                        <p className="pub-trust__text selectable">{item.text}</p>
                    </li>
                ))}
            </ul>
        </section>
    );
}
