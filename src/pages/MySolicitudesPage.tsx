import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import { calendarOutline } from 'ionicons/icons';
import PawLoader from '../components/common/PawLoader';
import { resolveImage } from '../components/adoptions/adoptionMapper';
import { getMisSolicitudes, solicitudError, type EstadoSolicitud, type Solicitud } from '../services/solicitudService';
import './MySolicitudesPage.css';

const ESTADO_LABEL: Record<EstadoSolicitud, string> = {
    PENDIENTE: 'Pendiente',
    APROBADA: 'Aprobada',
    RECHAZADA: 'Rechazada',
};

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });

export default function MySolicitudesPage() {
    const [items, setItems] = useState<Solicitud[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = useCallback(() => {
        setLoading(true);
        setError('');
        getMisSolicitudes()
            .then(setItems)
            .catch((err) => setError(solicitudError(err).message))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    let content;
    if (loading) {
        content = <PawLoader label="Cargando solicitudes…" />;
    } else if (error) {
        content = (
            <div className="mys-empty">
                <p>{error}</p>
                <button type="button" className="mys-button" onClick={load}>
                    Reintentar
                </button>
            </div>
        );
    } else if (items.length === 0) {
        content = (
            <div className="mys-empty">
                <p>Aún no has enviado solicitudes de adopción.</p>
                <Link to="/adopciones" className="mys-button">
                    Ver animales en adopción
                </Link>
            </div>
        );
    } else {
        content = (
            <ul className="mys-list">
                {items.map((s) => {
                    const image = resolveImage(s.animal_imagen ?? '');
                    return (
                        <li key={s.id}>
                            <Link to={`/adopciones/${s.animal_id}`} className="mys-item">
                                {image ? (
                                    <img src={image} alt="" className="mys-item__image" />
                                ) : (
                                    <span className="mys-item__image mys-item__image--empty" aria-hidden="true" />
                                )}
                                <span className="mys-item__body">
                                    <strong className="mys-item__name">{s.animal_nombre}</strong>
                                    <span className="mys-item__date">
                                        <IonIcon icon={calendarOutline} aria-hidden="true" />
                                        {formatDate(s.creado_en)}
                                    </span>
                                </span>
                                <span className={`mys-status mys-status--${s.estado.toLowerCase()}`}>
                                    {ESTADO_LABEL[s.estado]}
                                </span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        );
    }

    return (
        <div className="mys-page">
            <h1 className="mys-title">Mis solicitudes</h1>
            <p className="mys-subtitle selectable">Revisa el estado de tus postulaciones de adopción.</p>
            {content}
        </div>
    );
}