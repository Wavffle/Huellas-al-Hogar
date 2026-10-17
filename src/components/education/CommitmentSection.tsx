import { Link } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import { arrowForward } from 'ionicons/icons';
import commitmentImage from '../../assets/images/education/compromiso-perro.webp';
import './CommitmentSection.css';

export default function CommitmentSection() {
    return (
        <section className="commit" aria-labelledby="commit-title">
            <div className="commit__card">
                <h2 id="commit-title" className="commit__title">
                    Un hogar es un compromiso a largo plazo
                </h2>

                <div className="commit__media">
                    <img
                        src={commitmentImage}
                        alt="Un perro dorado jugando en el pasto con su familia"
                        className="commit__image"
                        loading="lazy"
                    />

                    <div className="commit__box">
                        <h3 className="commit__box-title">
                            Adoptar no significa solamente darle un hogar a un animal.
                        </h3>
                        <p className="commit__box-text selectable">
                            Significa comprometerse con su bienestar, sus necesidades y su cuidado
                            durante todas las etapas de su vida.
                        </p>
                        <Link to="/adopciones" className="commit__button">
                            Ver animales en adopción
                            <IonIcon icon={arrowForward} aria-hidden="true" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
