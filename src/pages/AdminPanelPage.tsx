import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { IonAlert, IonIcon } from '@ionic/react';
import { createOutline, searchOutline, trashOutline } from 'ionicons/icons';
import PawLoader from '../components/common/PawLoader';
import { resolveImage } from '../components/adoptions/adoptionMapper';
import { capitalize } from '../components/adoptions/adoptionDetail';
import { useAuth } from '../contexts/AuthContext';
import { deleteAnimal, getMisAnimales, type EstadoAnimal, type Publicacion } from '../services/animalService';
import { solicitudError } from '../services/solicitudService';
import { cambiarRol, listarUsuarios, type UsuarioAdmin } from '../services/usuarioService';
import type { ApiRole } from '../services/authService';
import {
    CATEGORIAS,
    actualizarContenido,
    crearContenido,
    eliminarContenido,
    getContenidos,
    type Contenido,
} from '../services/contenidoService';
import './RescuerPanelPage.css';
import './AdminPanelPage.css';

type Tab = 'usuarios' | 'publicaciones' | 'articulos';

const ROLES: { value: ApiRole; label: string }[] = [
    { value: 'ADOPTANTE', label: 'Adoptante' },
    { value: 'RESCATISTA', label: 'Rescatista' },
    { value: 'ADMIN', label: 'Administrador' },
];

const ESTADO_LABEL: Record<EstadoAnimal, string> = {
    EN_ADOPCION: 'En adopción',
    EN_TRATAMIENTO: 'En proceso',
    ADOPTADO: 'Adoptado',
};

const TABS: { id: Tab; label: string }[] = [
    { id: 'usuarios', label: 'Usuarios' },
    { id: 'publicaciones', label: 'Publicaciones' },
    { id: 'articulos', label: 'Artículos' },
];

/* ===================== Usuarios ===================== */
function UsersTab() {
    const { user } = useAuth();
    const [query, setQuery] = useState('');
    const [users, setUsers] = useState<UsuarioAdmin[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');

    // Espera un momento tras escribir para no pedir al servidor en cada tecla
    useEffect(() => {
        let cancelled = false;
        const timer = window.setTimeout(() => {
            setLoading(true);
            setError('');
            listarUsuarios(query.trim())
                .then((list) => !cancelled && setUsers(list))
                .catch((err) => !cancelled && setError(solicitudError(err).message))
                .finally(() => !cancelled && setLoading(false));
        }, 300);
        return () => {
            cancelled = true;
            window.clearTimeout(timer);
        };
    }, [query]);

    const changeRole = async (u: UsuarioAdmin, rol: ApiRole) => {
        if (rol === u.rol) return;
        setNotice('');
        try {
            await cambiarRol(u.id, rol);
            setUsers((list) => list.map((x) => (x.id === u.id ? { ...x, rol } : x)));
        } catch (err) {
            setNotice(solicitudError(err).message);
        }
    };

    return (
        <>
            <label className="adm-search">
                <IonIcon icon={searchOutline} aria-hidden="true" />
                <input
                    type="search"
                    placeholder="Buscar por nombre o correo..."
                    aria-label="Buscar usuarios"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </label>

            {notice && (
                <p className="pan-notice" role="alert">
                    {notice}
                </p>
            )}

            {loading ? (
                <PawLoader label="Cargando usuarios…" />
            ) : error ? (
                <div className="pan-empty">
                    <p>{error}</p>
                </div>
            ) : users.length === 0 ? (
                <div className="pan-empty">
                    <p>No se encontraron usuarios.</p>
                </div>
            ) : (
                <div className="adm-table-wrap">
                    <table className="adm-table">
                        <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Correo</th>
                            <th>Publicaciones</th>
                            <th>Rol</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map((u) => (
                            <tr key={u.id}>
                                <td data-label="Nombre">{u.nombre}</td>
                                <td data-label="Correo">{u.correo}</td>
                                <td data-label="Publicaciones">{u.publicaciones}</td>
                                <td data-label="Rol">
                                    <select
                                        className="adm-select"
                                        aria-label={`Rol de ${u.nombre}`}
                                        value={u.rol}
                                        disabled={u.id === user?.id}
                                        title={u.id === user?.id ? 'No puedes cambiar tu propio rol' : undefined}
                                        onChange={(e) => void changeRole(u, e.target.value as ApiRole)}
                                    >
                                        {ROLES.map((r) => (
                                            <option key={r.value} value={r.value}>
                                                {r.label}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}

/* ===================== Publicaciones ===================== */
function PostsTab() {
    const [items, setItems] = useState<Publicacion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [toDelete, setToDelete] = useState<Publicacion | null>(null);

    const load = useCallback(() => {
        setLoading(true);
        setError('');
        getMisAnimales(true)
            .then(setItems)
            .catch((err) => setError(solicitudError(err).message))
            .finally(() => setLoading(false));
    }, []);

    useEffect(load, [load]);

    const confirmDelete = async () => {
        if (!toDelete) return;
        setNotice('');
        try {
            await deleteAnimal(toDelete.id);
            setItems((list) => list.filter((a) => a.id !== toDelete.id));
        } catch (err) {
            setNotice(solicitudError(err).message);
        }
    };

    return (
        <>
            {notice && (
                <p className="pan-notice" role="alert">
                    {notice}
                </p>
            )}

            {loading ? (
                <PawLoader label="Cargando publicaciones…" />
            ) : error ? (
                <div className="pan-empty">
                    <p>{error}</p>
                    <button type="button" className="pan-btn" onClick={load}>
                        Reintentar
                    </button>
                </div>
            ) : items.length === 0 ? (
                <div className="pan-empty">
                    <p>No hay publicaciones.</p>
                </div>
            ) : (
                <ul className="adm-rows">
                    {items.map((a) => {
                        const image = resolveImage(a.imagen_portada ?? '');
                        return (
                            <li key={a.id} className={`adm-row${a.estado === 'ADOPTADO' ? ' is-adopted' : ''}`}>
                                {image ? <img src={image} alt="" className="adm-row__img" /> : <span className="adm-row__img pan-card__noimg" />}
                                <div className="adm-row__body">
                                    <strong>{a.nombre}</strong>
                                    <span className="adm-row__meta">
                                        {capitalize(a.especie)} · {ESTADO_LABEL[a.estado]} · por {a.publicador_nombre ?? '—'}
                                    </span>
                                </div>
                                <Link to={`/adopciones/${a.id}`} className="pan-btn pan-btn--outline">
                                    Ver
                                </Link>
                                <button type="button" className="pan-btn pan-btn--danger" onClick={() => setToDelete(a)}>
                                    <IonIcon icon={trashOutline} aria-hidden="true" />
                                    Eliminar
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}

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
        </>
    );
}

/* ===================== Artículos ===================== */
const EMPTY_FORM = { titulo: '', categoria: CATEGORIAS[0] as string, contenido: '' };

function ArticlesTab() {
    const [items, setItems] = useState<Contenido[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [form, setForm] = useState(EMPTY_FORM);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [toDelete, setToDelete] = useState<Contenido | null>(null);

    const load = useCallback(() => {
        setLoading(true);
        setError('');
        getContenidos()
            .then(setItems)
            .catch((err) => setError(solicitudError(err).message))
            .finally(() => setLoading(false));
    }, []);

    useEffect(load, [load]);

    const reset = () => {
        setForm(EMPTY_FORM);
        setEditingId(null);
    };

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        if (saving) return;
        if (!form.titulo.trim() || !form.contenido.trim()) {
            setNotice('El título y el contenido son obligatorios.');
            return;
        }
        setSaving(true);
        setNotice('');
        try {
            if (editingId !== null) await actualizarContenido(editingId, form);
            else await crearContenido(form);
            reset();
            load();
        } catch (err) {
            setNotice(solicitudError(err).message);
        } finally {
            setSaving(false);
        }
    };

    const startEdit = (a: Contenido) => {
        setEditingId(a.id);
        setForm({ titulo: a.titulo, categoria: a.categoria, contenido: a.contenido });
        setNotice('');
    };

    const confirmDelete = async () => {
        if (!toDelete) return;
        setNotice('');
        try {
            await eliminarContenido(toDelete.id);
            if (editingId === toDelete.id) reset();
            load();
        } catch (err) {
            setNotice(solicitudError(err).message);
        }
    };

    return (
        <>
            <form className="adm-form" onSubmit={submit} noValidate>
                <h2 className="adm-form__title">{editingId !== null ? 'Editar artículo' : 'Nuevo artículo'}</h2>

                <label className="adm-field">
                    <span>Título</span>
                    <input
                        type="text"
                        maxLength={150}
                        value={form.titulo}
                        onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                    />
                </label>

                <label className="adm-field">
                    <span>Categoría</span>
                    <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
                        {CATEGORIAS.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                        {/* Si un artículo viejo tiene otra categoría, no se pierde al editarlo */}
                        {!CATEGORIAS.includes(form.categoria as (typeof CATEGORIAS)[number]) && (
                            <option value={form.categoria}>{form.categoria}</option>
                        )}
                    </select>
                </label>

                <label className="adm-field">
                    <span>Contenido</span>
                    <textarea
                        rows={7}
                        value={form.contenido}
                        onChange={(e) => setForm({ ...form, contenido: e.target.value })}
                    />
                </label>

                {notice && (
                    <p className="pan-notice" role="alert">
                        {notice}
                    </p>
                )}

                <div className="pan-actions">
                    <button type="submit" className="pan-btn" disabled={saving}>
                        {saving ? 'Guardando…' : editingId !== null ? 'Guardar cambios' : 'Publicar artículo'}
                    </button>
                    {editingId !== null && (
                        <button type="button" className="pan-btn pan-btn--outline" onClick={reset}>
                            Cancelar
                        </button>
                    )}
                </div>
            </form>

            {loading ? (
                <PawLoader label="Cargando artículos…" />
            ) : error ? (
                <div className="pan-empty">
                    <p>{error}</p>
                    <button type="button" className="pan-btn" onClick={load}>
                        Reintentar
                    </button>
                </div>
            ) : items.length === 0 ? (
                <div className="pan-empty">
                    <p>Aún no hay artículos.</p>
                </div>
            ) : (
                <ul className="adm-rows">
                    {items.map((a) => (
                        <li key={a.id} className="adm-row">
                            <div className="adm-row__body">
                                <strong>{a.titulo}</strong>
                                <span className="adm-row__meta">{a.categoria}</span>
                            </div>
                            <button type="button" className="pan-btn pan-btn--outline" onClick={() => startEdit(a)}>
                                <IonIcon icon={createOutline} aria-hidden="true" />
                                Editar
                            </button>
                            <button type="button" className="pan-btn pan-btn--danger" onClick={() => setToDelete(a)}>
                                <IonIcon icon={trashOutline} aria-hidden="true" />
                                Eliminar
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <IonAlert
                isOpen={toDelete !== null}
                header="Eliminar artículo"
                message={`Se eliminará «${toDelete?.titulo ?? ''}». Esta acción no se puede deshacer.`}
                buttons={[
                    { text: 'Cancelar', role: 'cancel' },
                    { text: 'Eliminar', role: 'destructive', handler: () => void confirmDelete() },
                ]}
                onDidDismiss={() => setToDelete(null)}
            />
        </>
    );
}

/* ===================== Página ===================== */
export default function AdminPanelPage() {
    const [tab, setTab] = useState<Tab>('usuarios');

    return (
        <div className="pan-page">
            <h1 className="pan-title">Administración</h1>
            <p className="pan-subtitle selectable">
                Gestiona usuarios y roles, modera publicaciones y administra los artículos educativos.
            </p>

            <div className="pan-tabs" role="tablist">
                {TABS.map((t) => (
                    <button
                        key={t.id}
                        type="button"
                        role="tab"
                        aria-selected={tab === t.id}
                        className={`pan-tab${tab === t.id ? ' is-active' : ''}`}
                        onClick={() => setTab(t.id)}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === 'usuarios' && <UsersTab />}
            {tab === 'publicaciones' && <PostsTab />}
            {tab === 'articulos' && <ArticlesTab />}
        </div>
    );
}