import { IonIcon } from '@ionic/react';
import { checkmark, chevronDown, searchOutline } from 'ionicons/icons';
import type { Species } from '../../data/adoptions';
import {
    AGE_OPTIONS,
    SEX_OPTIONS,
    SIZE_OPTIONS,
    SPECIES_OPTIONS,
    type Filters,
} from './adoptionUtils';
import './AdoptionFilters.css';

function toggle<T>(list: T[], value: T): T[] {
    return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function CheckOption({
                         label,
                         checked,
                         onChange,
                     }: {
    label: string;
    checked: boolean;
    onChange: () => void;
}) {
    return (
        <label className="adop-filters__option">
            <input type="checkbox" className="adop-filters__input" checked={checked} onChange={onChange} />
            <span className="adop-filters__box" aria-hidden="true">
                <IonIcon icon={checkmark} />
            </span>
            {label}
        </label>
    );
}

function CheckGroup<T extends string>({
                                          title,
                                          options,
                                          selected,
                                          onToggle,
                                      }: {
    title: string;
    options: { value: T; label: string }[];
    selected: T[];
    onToggle: (value: T) => void;
}) {
    return (
        <fieldset className="adop-filters__group">
            <legend className="adop-filters__legend">{title}</legend>
            {options.map((o) => (
                <CheckOption
                    key={o.value}
                    label={o.label}
                    checked={selected.includes(o.value)}
                    onChange={() => onToggle(o.value)}
                />
            ))}
        </fieldset>
    );
}

interface Props {
    filters: Filters;
    cities: string[];
    /** En desktop el buscador va dentro del panel; en móvil va fuera. */
    showSearch?: boolean;
    onChange: (next: Filters) => void;
    onClear: () => void;
}

export default function AdoptionFilters({ filters, cities, showSearch = false, onChange, onClear }: Props) {
    const toggleSpecies = (value: Species) => {
        const next = toggle(filters.species, value);
        // Si quedan todas marcadas, equivale a "Todos"
        onChange({ ...filters, species: next.length === SPECIES_OPTIONS.length ? [] : next });
    };

    return (
        <div className="adop-filters">
            <div className="adop-filters__head">
                <h2 className="adop-filters__title">Filtros</h2>
                <button type="button" className="adop-filters__clear" onClick={onClear}>
                    Limpiar filtros
                </button>
            </div>

            <fieldset className="adop-filters__group">
                <legend className="adop-filters__legend">Especie</legend>
                <CheckOption
                    label="Todos"
                    checked={filters.species.length === 0}
                    onChange={() => onChange({ ...filters, species: [] })}
                />
                {SPECIES_OPTIONS.map((o) => (
                    <CheckOption
                        key={o.value}
                        label={o.label}
                        checked={filters.species.includes(o.value)}
                        onChange={() => toggleSpecies(o.value)}
                    />
                ))}
            </fieldset>

            <CheckGroup
                title="Edad"
                options={AGE_OPTIONS}
                selected={filters.ages}
                onToggle={(v) => onChange({ ...filters, ages: toggle(filters.ages, v) })}
            />
            <CheckGroup
                title="Tamaño"
                options={SIZE_OPTIONS}
                selected={filters.sizes}
                onToggle={(v) => onChange({ ...filters, sizes: toggle(filters.sizes, v) })}
            />
            <CheckGroup
                title="Sexo"
                options={SEX_OPTIONS}
                selected={filters.sexes}
                onToggle={(v) => onChange({ ...filters, sexes: toggle(filters.sexes, v) })}
            />

            <fieldset className="adop-filters__group">
                <legend className="adop-filters__legend">Ubicación</legend>
                <div className="adop-filters__field">
                    <select
                        className="adop-filters__select"
                        aria-label="Ciudad"
                        value={filters.city}
                        onChange={(e) => onChange({ ...filters, city: e.target.value })}
                    >
                        <option value="">Todas las ciudades</option>
                        {cities.map((city) => (
                            <option key={city} value={city}>
                                {city}
                            </option>
                        ))}
                    </select>
                    <IonIcon icon={chevronDown} className="adop-filters__chevron" aria-hidden="true" />
                </div>
            </fieldset>

            {showSearch && (
                <div className="adop-filters__group">
                    <label className="adop-filters__field">
                        <IonIcon icon={searchOutline} className="adop-filters__search-icon" aria-hidden="true" />
                        <input
                            type="search"
                            className="adop-filters__search"
                            placeholder="Buscar por nombre..."
                            aria-label="Buscar por nombre"
                            value={filters.search}
                            onChange={(e) => onChange({ ...filters, search: e.target.value })}
                        />
                    </label>
                </div>
            )}
        </div>
    );
}