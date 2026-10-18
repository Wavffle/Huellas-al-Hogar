import type { AdoptionAnimal, Sex, Size, Species } from '../data/adoptions';

function normalize(value: unknown): string {
    return String(value ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapAnimal(raw: any): AdoptionAnimal {
    const species: Species = normalize(raw.especie).startsWith('gat') ? 'gato' : 'perro';

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
        image: raw.foto_url ?? '',
    };
}