import type { AdoptionAnimal, AgeGroup, Sex, Size, Species } from '../../data/adoptions';

export const SPECIES_LABEL: Record<Species, string> = { perro: 'Perro', gato: 'Gato', otro: 'Otro' };

export function formatAge(months: number): string {
    if (months < 12) return `${months} ${months === 1 ? 'Mes' : 'Meses'}`;
    const years = Math.floor(months / 12);
    return `${years} ${years === 1 ? 'Año' : 'Años'}`;
}

export function getAgeGroup(months: number): AgeGroup {
    if (months < 12) return 'cachorro';
    if (months <= 84) return 'adulto';
    return 'senior';
}

/* ===== Opciones de los filtros ===== */
export const SPECIES_OPTIONS: { value: Species; label: string }[] = [
    { value: 'perro', label: 'Perros' },
    { value: 'gato', label: 'Gatos' },
    { value: 'otro', label: 'Otros' },
];
export const AGE_OPTIONS: { value: AgeGroup; label: string }[] = [
    { value: 'cachorro', label: 'Cachorro (0 - 1 año)' },
    { value: 'adulto', label: 'Adulto (1 - 7 años)' },
    { value: 'senior', label: 'Senior (+ 7 años)' },
];
export const SIZE_OPTIONS: { value: Size; label: string }[] = [
    { value: 'pequeño', label: 'Pequeño' },
    { value: 'mediano', label: 'Mediano' },
    { value: 'grande', label: 'Grande' },
];
export const SEX_OPTIONS: { value: Sex; label: string }[] = [
    { value: 'macho', label: 'Macho' },
    { value: 'hembra', label: 'Hembra' },
];

/* ===== Filtrado ===== */
export interface Filters {
    species: Species[];
    ages: AgeGroup[];
    sizes: Size[];
    sexes: Sex[];
    city: string;
    search: string;
}

export const EMPTY_FILTERS: Filters = {
    species: [],
    ages: [],
    sizes: [],
    sexes: [],
    city: '',
    search: '',
};

function normalize(text: string): string {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export function filterAnimals(list: AdoptionAnimal[], f: Filters): AdoptionAnimal[] {
    const query = normalize(f.search.trim());
    return list.filter(
        (a) =>
            (f.species.length === 0 || f.species.includes(a.species)) &&
            (f.ages.length === 0 || f.ages.includes(getAgeGroup(a.ageMonths))) &&
            (f.sizes.length === 0 || f.sizes.includes(a.size)) &&
            (f.sexes.length === 0 || f.sexes.includes(a.sex)) &&
            (!f.city || a.city === f.city) &&
            (!query || normalize(a.name).includes(query)),
    );
}

/* ===== Orden ===== */
export type SortKey = 'recientes' | 'nombre' | 'menor-edad' | 'mayor-edad';

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
    { value: 'recientes', label: 'Más recientes' },
    { value: 'nombre', label: 'Nombre (A - Z)' },
    { value: 'menor-edad', label: 'Menor edad' },
    { value: 'mayor-edad', label: 'Mayor edad' },
];

export function sortAnimals(list: AdoptionAnimal[], key: SortKey): AdoptionAnimal[] {
    if (key === 'recientes') return list; // los datos ya vienen del más reciente al más antiguo
    const copy = [...list];
    if (key === 'nombre') return copy.sort((a, b) => a.name.localeCompare(b.name, 'es'));
    if (key === 'menor-edad') return copy.sort((a, b) => a.ageMonths - b.ageMonths);
    return copy.sort((a, b) => b.ageMonths - a.ageMonths);
}
