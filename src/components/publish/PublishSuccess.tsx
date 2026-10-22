import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import { arrowForward, checkmarkCircle } from 'ionicons/icons';
import art from '../../assets/images/publicar/publicar-perro-gato-lineas.svg';
import './PublishSuccess.css';

interface Props {
    name: string;
    /** Vuelve al formulario vacío. */
    onAnother: () => void;
}

export default function PublishSuccess({ name, onAnother }: Props) {
    const titleRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        titleRef.current?.focus({ preventScroll: true });
    }, []);

    return (
        <section className="pub-success" aria-labelledby="pub-success-title">
            <div className="pub-success__art">
                <img src={art} alt="" />
                <IonIcon icon={checkmarkCircle} className="pub-success__badge" aria-hidden="true" />
            </div>

            <h2 id="pub-success-title" ref={titleRef} tabIndex={-1} className="pub-success__title">
                ¡Publicación enviada!
            </h2>
            <p className="pub-success__text selectable">
                Revisaremos la información de {name} antes de publicarla. Cuando esté aprobada, aparecerá en el
                listado de animales en adopción.
            </p>

            <div className="pub-success__actions">
                <Link to="/adopciones" className="pub-btn">
                    Ver animales en adopción
                    <IonIcon icon={arrowForward} aria-hidden="true" />
                </Link>
                <button type="button" className="pub-btn pub-btn--outline" onClick={onAnother}>
                    Publicar otro animal
                </button>
            </div>
        </section>
    );
}
