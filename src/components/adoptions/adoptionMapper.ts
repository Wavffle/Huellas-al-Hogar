import type { AdoptionAnimal, Sex, Size, Species } from '../../data/adoptions';

/** Origen del backend: las rutas /uploads se sirven desde ahí. */
const API_ORIGIN = 'http://localhost:3000';

export function normalize(value: unknown): string {
    return String(value ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

export function resolveImage(path: string): string {
    if (!path) return '';
    if (/^(https?:|data:)/.test(path)) return path;
    if (path.startsWith('/uploads')) return `${API_ORIGIN}${path}`;
    return path;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getPhotos(raw: any): string[] {
    const list: unknown[] = Array.isArray(raw.fotos) ? raw.fotos : raw.foto_url ? [raw.foto_url] : [];
    return list.map((p) => resolveImage(String(p))).filter(Boolean);
}

function toSpecies(value: unknown): Species {
    const text = normalize(value);
    if (text.startsWith('gat')) return 'gato';
    if (!text || text.startsWith('perr')) return 'perro';
    return 'otro';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapAnimal(raw: any): AdoptionAnimal {
    const species = toSpecies(raw.especie);

    const sizeRaw = normalize(raw.tamanho);
    const size: Size = sizeRaw === 'pequeno' ? 'pequeño' : sizeRaw === 'grande' ? 'grande' : 'mediano';

    const sex: Sex = normalize(raw.sexo) === 'hembra' ? 'hembra' : 'macho';

    // Si el backend agrega edad_meses, tiene prioridad sobre edad en años
    const ageMonths =
        raw.edad_meses != null ? Number(raw.edad_meses) : Math.round(Number(raw.edad ?? 0) * 12);

    return {
        id: String(raw.id),
        name: raw.nombre ?? 'Sin nombre',
        species,
        ageMonths,
        size,
        sex,
        city: raw.ciudad ?? 'Sin ciudad',
        image: getPhotos(raw)[0] ?? '',
    };
}
