import { Link, useLocation } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import { checkmarkCircleOutline, mailOutline } from 'ionicons/icons';
import { useAuth } from '../contexts/AuthContext';
import './RescuerRequirementsPage.css';

const REQUIREMENTS = [
    { title: 'Identidad verificada', text: 'Nombre completo y documento de identidad vigente.' },
    { title: 'Contacto confirmado', text: 'Correo y teléfono activos para que los adoptantes puedan comunicarse.' },
    { title: 'Espacio adecuado', text: 'Contar con un lugar seguro donde cuidar a los animales mientras encuentran un hogar.' },
    {
        title: 'Experiencia o respaldo',
        text: 'Pertenecer a una fundación o refugio, o contar tu experiencia rescatando y cuidando animales.',
    },
    { title: 'Información veraz', text: 'Publicar solo animales reales, con su estado de salud y origen verdaderos.' },
    { title: 'Adopción sin fines de lucro', text: 'No vender animales ni pedir pagos a cambio de una adopción.' },
];

// Provisional: reemplazar por el correo real del proyecto
const CONTACT_EMAIL = 'contacto@huellasalhogar.cl';

export default function RescuerRequirementsPage() {
    const { user } = useAuth();
    const location = useLocation();

    return (
        <div className="resc-page">
            <header className="resc-head">
                <h1 className="resc-head__title">
                    Para publicar un animal, tienes que ser <span>rescatista</span> primero
                </h1>
                <p className="resc-head__text selectable">
                    Para proteger a los animales y a quienes los adoptan, solo los rescatistas verificados pueden
                    publicar. Estos son los requisitos para serlo.
                </p>
            </header>

            <ul className="resc-list">
                {REQUIREMENTS.map((item) => (
                    <li key={item.title} className="resc-item">
                        <IonIcon icon={checkmarkCircleOutline} className="resc-item__icon" aria-hidden="true" />
                        <div>
                            <h2 className="resc-item__title">{item.title}</h2>
                            <p className="resc-item__text selectable">{item.text}</p>
                        </div>
                    </li>
                ))}
            </ul>

            <div className="resc-cta">
                {user ? (
                    <>
                        <p className="resc-cta__text">
                            <strong>Tu cuenta es de adoptante. </strong>
                            <span>
                                Envía tu solicitud y un administrador la revisará para asignarte el rol de rescatista.
                            </span>
                        </p>
                        <a
                            href={`mailto:${CONTACT_EMAIL}?subject=Solicitud%20para%20ser%20rescatista`}
                            className="resc-button"
                        >
                            <IonIcon icon={mailOutline} aria-hidden="true" />
                            Solicitar ser rescatista
                        </a>
                    </>
                ) : (
                    <>
                        <p className="resc-cta__text">Inicia sesión para comenzar el proceso.</p>
                        <Link to={{ pathname: '/login', state: { from: location } }} className="resc-button">
                            Iniciar sesión
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}