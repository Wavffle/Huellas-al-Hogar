import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { IonContent, IonIcon, IonModal } from '@ionic/react';
import { chevronDown, closeOutline, searchOutline } from 'ionicons/icons';
import type { AdoptionAnimal } from '../data/adoptions';
import { getAnimales } from '../services/animalService';
import PawLoader from '../components/common/PawLoader';
import AdoptionsHero from '../components/adoptions/AdoptionsHero';
import AdoptionFilters from '../components/adoptions/AdoptionFilters';
import AdoptionCard from '../components/adoptions/AdoptionCard';
import Pagination from '../components/adoptions/Pagination';
import { mapAnimal } from '../components/adoptions/adoptionMapper';
import {
    EMPTY_FILTERS,
    SORT_OPTIONS,
    filterAnimals,
    sortAnimals,
    type Filters,
    type SortKey,
} from '../components/adoptions/adoptionUtils';
import './AdoptionsPage.css';

const PAGE_SIZE = 15;

export default function AdoptionsPage() {
    const [animals, setAnimals] = useState<AdoptionAnimal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
    const [sort, setSort] = useState<SortKey>('recientes');
    const [page, setPage] = useState(1);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const toolbarRef = useRef<HTMLDivElement>(null);

    const loadAnimals = useCallback(() => {
        setLoading(true);
        setError(null);
        getAnimales()
            .then((response) => {
                // El backend puede devolver [...] o { success, data: [...] }
                const list = Array.isArray(response) ? response : response?.data ?? [];
                setAnimals(list.map(mapAnimal));
            })
            .catch((err) => {
                console.error('Error al cargar animales:', err);
                setError('No se pudo obtener la lista de animales.');
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        loadAnimals();
    }, [loadAnimals]);

    const cities = useMemo(
        () => Array.from(new Set(animals.map((a) => a.city))).sort((a, b) => a.localeCompare(b, 'es')),
        [animals],
    );

    const results = useMemo(() => sortAnimals(filterAnimals(animals, filters), sort), [animals, filters, sort]);
    const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const visible = results.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const updateFilters = (next: Filters) => {
        setFilters(next);
        setPage(1);
    };
    const clearFilters = () => updateFilters(EMPTY_FILTERS);

    const goToPage = (next: number) => {
        setPage(next);
        toolbarRef.current?.closest('ion-content')?.scrollToTop(0);
    };

    const countLabel = `(${results.length}) ${results.length === 1 ? 'Mascota esperándote' : 'Mascotas esperándote'}`;

    let content;
    if (loading) {
        content = (
            <div className="adop-empty">
                <PawLoader label="Cargando animales…" />
            </div>
        );
    } else if (error) {
        content = (
            <div className="adop-empty">
                <p>{error}</p>
                <button type="button" className="adop-empty__button" onClick={loadAnimals}>
                    Reintentar
                </button>
            </div>
        );
    } else if (animals.length === 0) {
        content = (
            <div className="adop-empty">
                <p>No hay animales registrados por el momento.</p>
            </div>
        );
    } else if (visible.length === 0) {
        content = (
            <div className="adop-empty">
                <p>No encontramos mascotas con esos filtros.</p>
                <button type="button" className="adop-empty__button" onClick={clearFilters}>
                    Limpiar filtros
                </button>
            </div>
        );
    } else {
        content = (
            <>
                <ul className="adop-grid">
                    {visible.map((animal) => (
                        <li key={animal.id}>
                            <AdoptionCard animal={animal} />
                        </li>
                    ))}
                </ul>
                <Pagination page={currentPage} totalPages={totalPages} onChange={goToPage} />
            </>
        );
    }

    return (
        <div className="adop-page">
            <AdoptionsHero />

            <section className="adop-listing" aria-label="Animales en adopción">
                <aside className="adop-aside" aria-label="Filtros">
                    <AdoptionFilters
                        filters={filters}
                        cities={cities}
                        showSearch
                        onChange={updateFilters}
                        onClear={clearFilters}
                    />
                </aside>

                <div className="adop-results">
                    <div className="adop-toolbar" ref={toolbarRef}>
                        {/* Solo móvil: en desktop el buscador está dentro del panel */}
                        <label className="adop-toolbar__search">
                            <IonIcon icon={searchOutline} aria-hidden="true" />
                            <input
                                type="search"
                                placeholder="Buscar por nombre..."
                                aria-label="Buscar por nombre"
                                value={filters.search}
                                onChange={(e) => updateFilters({ ...filters, search: e.target.value })}
                            />
                        </label>

                        <button type="button" className="adop-toolbar__filters" onClick={() => setFiltersOpen(true)}>
                            Filtros
                        </button>

                        <label className="adop-sort">
                            <span className="adop-sort__label">Ordenar por:</span>
                            <span className="adop-sort__field">
                                <select
                                    className="adop-sort__select"
                                    aria-label="Ordenar por"
                                    value={sort}
                                    onChange={(e) => {
                                        setSort(e.target.value as SortKey);
                                        setPage(1);
                                    }}
                                >
                                    {SORT_OPTIONS.map((o) => (
                                        <option key={o.value} value={o.value}>
                                            {o.label}
                                        </option>
                                    ))}
                                </select>
                                <IonIcon icon={chevronDown} className="adop-sort__icon" aria-hidden="true" />
                            </span>
                        </label>

                        <p className="adop-toolbar__count" aria-live="polite">
                            {loading || error ? '' : countLabel}
                        </p>
                    </div>

                    {content}
                </div>
            </section>

            {/* Móvil: filtros en un modal */}
            <IonModal isOpen={filtersOpen} onDidDismiss={() => setFiltersOpen(false)}>
                <IonContent>
                    <div className="adop-modal">
                        <button
                            type="button"
                            className="adop-modal__close"
                            aria-label="Cerrar filtros"
                            onClick={() => setFiltersOpen(false)}
                        >
                            <IonIcon icon={closeOutline} />
                        </button>
                        <AdoptionFilters
                            filters={filters}
                            cities={cities}
                            onChange={updateFilters}
                            onClear={clearFilters}
                        />
                        <button type="button" className="adop-modal__apply" onClick={() => setFiltersOpen(false)}>
                            Ver {results.length} {results.length === 1 ? 'resultado' : 'resultados'}
                        </button>
                    </div>
                </IonContent>
            </IonModal>
        </div>
    );
}