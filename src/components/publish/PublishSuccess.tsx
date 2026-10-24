import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import { arrowForward, checkmarkCircle } from 'ionicons/icons';
import art from '../../assets/images/publicar/publicar-perro-gato-lineas.svg';
import './PublishSuccess.css';

interface Props {
    name: string;
    /** create: publicó un animal nuevo. edit: guardó cambios. */
    mode?: 'create' | 'edit';
    /** id del animal editado (para el enlace a su ficha). */
    animalId?: string;
    /** Vuelve al formulario vacío (solo al crear). */
    onAnother: () => void;
}

export default function PublishSuccess({ name, mode = 'create', animalId, onAnother }: Props) {
    const titleRef = useRef<HTMLHeadingElement>(null);
    const editing = mode === 'edit';

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
                {editing ? '¡Cambios guardados!' : '¡Animal publicado!'}
            </h2>
            <p className="pub-success__text selectable">
                {editing
                    ? `Los cambios en la publicación de ${name} ya están visibles.`
                    : `${name} ya está visible en el listado de animales en adopción. Si la publicación incumple las normas, un administrador puede retirarla.`}
            </p>

            <div className="pub-success__actions">
                <Link to={editing && animalId ? `/adopciones/${animalId}` : '/adopciones'} className="pub-btn">
                    {editing ? 'Ver la publicación' : 'Ver animales en adopción'}
                    <IonIcon icon={arrowForward} aria-hidden="true" />
                </Link>
                <Link to="/panel" className="pub-btn pub-btn--outline">
                    Ir a mi panel
                </Link>
                {!editing && (
                    <button type="button" className="pub-btn pub-btn--outline" onClick={onAnother}>
                        Publicar otro animal
                    </button>
                )}
            </div>
        </section>
    );
}