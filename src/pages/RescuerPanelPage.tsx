import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IonAlert, IonContent, IonIcon, IonModal } from '@ionic/react';
import { calendarOutline, callOutline, closeOutline, createOutline, mailOutline, trashOutline } from 'ionicons/icons';
import PawLoader from '../components/common/PawLoader';
import { resolveImage } from '../components/adoptions/adoptionMapper';
import { capitalize } from '../components/adoptions/adoptionDetail';
import {
    deleteAnimal,
    getMisAnimales,
    updateAnimal,
    type EstadoAnimal,
    type Publicacion,
} from '../services/animalService';
import {
    getSolicitudesRecibidas,
    solicitudError,
    updateSolicitudEstado,
    type EstadoSolicitud,
    type Solicitud,
} from '../services/solicitudService';
import './RescuerPanelPage.css';

type Tab = 'publicaciones' | 'solicitudes';

const ESTADOS: { value: EstadoAnimal; label: string }[] = [
    { value: 'EN_ADOPCION', label: 'En adopción' },
    { value: 'EN_TRATAMIENTO', label: 'En proceso' },
    { value: 'ADOPTADO', label: 'Adoptado' },
];

const SOLICITUD_LABEL: Record<EstadoSolicitud, string> = {
    PENDIENTE: 'Pendiente',
    APROBADA: 'Aprobada',
    RECHAZADA: 'Rechazada',
};

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });

export default function RescuerPanelPage() {
    const { search } = useLocation();
    const [tab, setTab] = useState<Tab>(
        new URLSearchParams(search).get('tab') === 'solicitudes' ? 'solicitudes' : 'publicaciones',
    );
    const [animals, setAnimals] = useState<Publicacion[]>([]);
    const [requests, setRequests] = useState<Solicitud[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [toDelete, setToDelete] = useState<Publicacion | null>(null);
    const [selected, setSelected] = useState<Solicitud | null>(null);
    const [modalError, setModalError] = useState('');
    const [busy, setBusy] = useState(false);

    const load = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        setError('');
        try {
            const [a, r] = await Promise.all([getMisAnimales(), getSolicitudesRecibidas()]);
            setAnimals(a);
            setRequests(r);
        } catch (err) {
            setError(solicitudError(err).message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const pendingTotal = requests.filter((s) => s.estado === 'PENDIENTE').length;

    // Solicitudes agrupadas por animal, en el orden en que llegan
    const groups = useMemo(() => {
        const map = new Map<
            number,
            { id: number; name: string; image: string | null; estado: string; items: Solicitud[] }
        >();
        for (const s of requests) {
            const group = map.get(s.animal_id) ?? {
                id: s.animal_id,
                name: s.animal_nombre,
                image: s.animal_imagen,
                estado: s.animal_estado,
                items: [],
            };
            group.items.push(s);
            map.set(s.animal_id, group);
        }
        return [...map.values()];
    }, [requests]);

    const changeEstado = async (animal: Publicacion, estado: EstadoAnimal) => {
        if (estado === animal.estado) return;
        setNotice('');
        try {
            await updateAnimal(animal.id, { estado });
            setAnimals((list) => list.map((a) => (a.id === animal.id ? { ...a, estado } : a)));
        } catch (err) {
            setNotice(solicitudError(err).message);
        }
    };

    const confirmDelete = async () => {
        if (!toDelete) return;
        const target = toDelete;
        setNotice('');
        try {
            await deleteAnimal(target.id);
            await load(true); // también desaparecen sus solicitudes
        } catch (err) {
            setNotice(solicitudError(err).message);
        }
    };

    const decide = async (s: Solicitud, estado: 'APROBADA' | 'RECHAZADA') => {
        setBusy(true);
        setModalError('');
        try {
            await updateSolicitudEstado(s.id, estado);
            setSelected(null);
            await load(true);
        } catch (err) {
            setModalError(solicitudError(err).message);
        } finally {
            setBusy(false);
        }
    };

    let content;
    if (loading) {
        content = <PawLoader label="Cargando tu panel…" />;
    } else if (error) {
        content = (
            <div className="pan-empty">
                <p>{error}</p>
                <button type="button" className="pan-btn" onClick={() => void load()}>
                    Reintentar
                </button>
            </div>
        );
    } else if (tab === 'publicaciones') {
        content =
            animals.length === 0 ? (
                <div className="pan-empty">
                    <p>Aún no has publicado animales.</p>
                    <Link to="/publicar" className="pan-btn">
                        Publicar un animal
                    </Link>
                </div>
            ) : (
                <ul className="pan-list">
                    {animals.map((a) => {
                        const image = resolveImage(a.imagen_portada ?? '');
                        return (
                            <li key={a.id} className={`pan-card${a.estado === 'ADOPTADO' ? ' is-adopted' : ''}`}>
                                <Link to={`/adopciones/${a.id}`} className="pan-card__media" aria-label={`Ver a ${a.nombre}`}>
                                    {image ? <img src={image} alt="" /> : <span className="pan-card__noimg" />}
                                    {a.estado === 'ADOPTADO' && <span className="pan-card__ribbon">Adoptado</span>}
                                </Link>

                                <div className="pan-card__body">
                                    <h3 className="pan-card__name">{a.nombre}</h3>
                                    <p className="pan-card__meta">{capitalize(a.especie)}</p>

                                    {a.solicitudes_pendientes > 0 && (
                                        <button type="button" className="pan-pending" onClick={() => setTab('solicitudes')}>
                                            {a.solicitudes_pendientes}{' '}
                                            {a.solicitudes_pendientes === 1 ? 'solicitud pendiente' : 'solicitudes pendientes'}
                                        </button>
                                    )}

                                    <label className="pan-state">
                                        <span>Estado</span>
                                        <select
                                            value={a.estado}
                                            onChange={(e) => void changeEstado(a, e.target.value as EstadoAnimal)}
                                        >
                                            {ESTADOS.map((o) => (
                                                <option key={o.value} value={o.value}>
                                                    {o.label}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <div className="pan-actions">
                                        <Link to={`/publicar/${a.id}/editar`} className="pan-btn pan-btn--outline">
                                            <IonIcon icon={createOutline} aria-hidden="true" />
                                            Editar
                                        </Link>
                                        <button type="button" className="pan-btn pan-btn--danger" onClick={() => setToDelete(a)}>
                                            <IonIcon icon={trashOutline} aria-hidden="true" />
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            );
    } else {
        content =
            groups.length === 0 ? (
                <div className="pan-empty">
                    <p>Todavía no has recibido solicitudes de adopción.</p>
                </div>
            ) : (
                <div className="pan-groups">
                    {groups.map((g) => {
                        const image = resolveImage(g.image ?? '');
                        return (
                            <section key={g.id} className="pan-group" aria-label={`Solicitudes para ${g.name}`}>
                                <header className="pan-group__head">
                                    {image ? <img src={image} alt="" /> : <span className="pan-card__noimg" />}
                                    <h3>{g.name}</h3>
                                </header>
                                <ul className="pan-reqs">
                                    {g.items.map((s) => (
                                        <li key={s.id} className="pan-req">
                                            <div className="pan-req__who">
                                                <strong>{s.postulante_nombre}</strong>
                                                <span className="pan-req__date">
                                                    <IonIcon icon={calendarOutline} aria-hidden="true" />
                                                    {formatDate(s.creado_en)}
                                                </span>
                                            </div>
                                            <span className={`pan-status pan-status--${s.estado.toLowerCase()}`}>
                                                {SOLICITUD_LABEL[s.estado]}
                                            </span>
                                            <button
                                                type="button"
                                                className="pan-btn pan-btn--outline"
                                                onClick={() => {
                                                    setModalError('');
                                                    setSelected(s);
                                                }}
                                            >
                                                Ver detalle
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        );
                    })}
                </div>
            );
    }

    return (
        <div className="pan-page">
            <h1 className="pan-title">Mi panel</h1>
            <p className="pan-subtitle selectable">Gestiona tus publicaciones y revisa las solicitudes que recibes.</p>

            <div className="pan-tabs" role="tablist">
                <button
                    type="button"
                    role="tab"
                    aria-selected={tab === 'publicaciones'}
                    className={`pan-tab${tab === 'publicaciones' ? ' is-active' : ''}`}
                    onClick={() => setTab('publicaciones')}
                >
                    Mis publicaciones
                </button>
                <button
                    type="button"
                    role="tab"
                    aria-selected={tab === 'solicitudes'}
                    className={`pan-tab${tab === 'solicitudes' ? ' is-active' : ''}`}
                    onClick={() => setTab('solicitudes')}
                >
                    Solicitudes recibidas
                    {pendingTotal > 0 && <span className="pan-tab__count">{pendingTotal}</span>}
                </button>
            </div>

            {notice && (
                <p className="pan-notice" role="alert">
                    {notice}
                </p>
            )}

            {content}

            <IonAlert
                isOpen={toDelete !== null}
                header="Eliminar publicación"
                message={`Se eliminará a ${toDelete?.nombre ?? ''} junto con sus fotos y solicitudes. Esta acción no se puede deshacer.`}
                buttons={[
                    { text: 'Cancelar', role: 'cancel' },
                    { text: 'Eliminar', role: 'destructive', handler: () => void confirmDelete() },
                ]}
                onDidDismiss={() => setToDelete(null)}
            />

            <IonModal isOpen={selected !== null} onDidDismiss={() => setSelected(null)}>
                <IonContent>
                    {selected && (
                        <div className="pan-modal">
                            <button
                                type="button"
                                className="pan-modal__close"
                                aria-label="Cerrar detalle"
                                onClick={() => setSelected(null)}
                            >
                                <IonIcon icon={closeOutline} />
                            </button>

                            <h2 className="pan-modal__title">Solicitud para {selected.animal_nombre}</h2>
                            <span className={`pan-status pan-status--${selected.estado.toLowerCase()}`}>
                                {SOLICITUD_LABEL[selected.estado]}
                            </span>

                            <h3 className="pan-modal__section">Contacto</h3>
                            <dl className="pan-dl selectable">
                                <div>
                                    <dt>Nombre</dt>
                                    <dd>{selected.postulante_nombre}</dd>
                                </div>
                                <div>
                                    <dt>Correo</dt>
                                    <dd>
                                        <a href={`mailto:${selected.postulante_correo}`}>
                                            <IonIcon icon={mailOutline} aria-hidden="true" /> {selected.postulante_correo}
                                        </a>
                                    </dd>
                                </div>
                                <div>
                                    <dt>Teléfono</dt>
                                    <dd>
                                        {selected.telefono ? (
                                            <a href={`tel:${selected.telefono}`}>
                                                <IonIcon icon={callOutline} aria-hidden="true" /> {selected.telefono}
                                            </a>
                                        ) : (
                                            'Sin datos'
                                        )}
                                    </dd>
                                </div>
                                <div>
                                    <dt>Ciudad</dt>
                                    <dd>{selected.ciudad ?? 'Sin datos'}</dd>
                                </div>
                            </dl>

                            <h3 className="pan-modal__section">Hogar y experiencia</h3>
                            <dl className="pan-dl selectable">
                                <div>
                                    <dt>Vivienda</dt>
                                    <dd>{selected.tipo_vivienda}</dd>
                                </div>
                                <div>
                                    <dt>Patio o espacio exterior</dt>
                                    <dd>{selected.tiene_patio ? 'Sí' : 'No'}</dd>
                                </div>
                                <div>
                                    <dt>Convive con</dt>
                                    <dd>{selected.con_quien_convive}</dd>
                                </div>
                                <div>
                                    <dt>Ha tenido mascotas</dt>
                                    <dd>{selected.tuvo_mascotas ? 'Sí' : 'No'}</dd>
                                </div>
                                <div>
                                    <dt>Tiene mascotas ahora</dt>
                                    <dd>{selected.tiene_mascotas ? 'Sí' : 'No'}</dd>
                                </div>
                                <div>
                                    <dt>Experiencia</dt>
                                    <dd>{selected.experiencia || 'No indicó'}</dd>
                                </div>
                                <div>
                                    <dt>Motivo</dt>
                                    <dd>{selected.motivo}</dd>
                                </div>
                            </dl>

                            {modalError && (
                                <p className="pan-notice" role="alert">
                                    {modalError}
                                </p>
                            )}

                            {selected.estado === 'PENDIENTE' && (
                                <>
                                    <p className="pan-modal__hint selectable">
                                        Al aprobar, {selected.animal_nombre} pasa a «En proceso» y las demás solicitudes
                                        pendientes de este animal se rechazan.
                                    </p>
                                    <div className="pan-actions">
                                        <button
                                            type="button"
                                            className="pan-btn"
                                            disabled={busy}
                                            onClick={() => void decide(selected, 'APROBADA')}
                                        >
                                            Aprobar
                                        </button>
                                        <button
                                            type="button"
                                            className="pan-btn pan-btn--danger"
                                            disabled={busy}
                                            onClick={() => void decide(selected, 'RECHAZADA')}
                                        >
                                            Rechazar
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </IonContent>
            </IonModal>
        </div>
    );
}