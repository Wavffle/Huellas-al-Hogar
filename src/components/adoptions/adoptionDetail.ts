import type { AdoptionAnimal } from '../../data/adoptions';
import { getPhotos, mapAnimal, normalize } from './adoptionMapper';

export interface AnimalDetail extends AdoptionAnimal {
    photos: string[];
    status: string;
    origin: string;
    description: string;
    sterilized: 'si' | 'no' | 'no_sabe';
    vaccines: 'al_dia' | 'faltan' | 'no_tiene' | '';
    conviveCon: string[];
    idealPara: string[];
    tags: string[];
    ownerId: number | null;
}

function toList(value: unknown): string[] {
    return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapAnimalDetail(raw: any): AnimalDetail {
    const sterilizedRaw = normalize(raw.esterilizado);
    const vaccinesRaw = normalize(raw.vacunas_estado);

    return {
        ...mapAnimal(raw),
        photos: getPhotos(raw),
        status: raw.estado ?? 'EN_ADOPCION',
        origin: String(raw.rescate ?? raw.origen ?? ''),
        description: raw.descripcion ?? '',
        sterilized: sterilizedRaw === 'si' ? 'si' : sterilizedRaw === 'no' ? 'no' : 'no_sabe',
        vaccines:
            vaccinesRaw === 'al_dia' || vaccinesRaw === 'faltan' || vaccinesRaw === 'no_tiene'
                ? vaccinesRaw
                : '',
        conviveCon: toList(raw.convive_con),
        idealPara: toList(raw.ideal_para),
        tags: toList(raw.etiquetas),
        ownerId: raw.usuario_id != null ? Number(raw.usuario_id) : null,
    };
}

/* ===== Textos para mostrar ===== */
const STATUS_LABEL: Record<string, string> = {
    EN_ADOPCION: 'En adopción',
    ADOPTADO: 'Adoptado',
    EN_TRATAMIENTO: 'En proceso',
};
export const statusLabel = (status: string) => STATUS_LABEL[status] ?? 'En adopción';

const ORIGIN_LABEL: Record<string, string> = {
    RESCATE: 'Rescate',
    FAMILIA: 'Familia',
    ENTREGADO_FAMILIA: 'Familia',
    REFUGIO: 'Refugio',
    CAMADA: 'Camada',
};
export const originLabel = (origin: string) => ORIGIN_LABEL[origin] ?? 'Sin datos';

export function sterilizedLabel(a: AnimalDetail): string {
    const female = a.sex === 'hembra';
    if (a.sterilized === 'si') return female ? 'Esterilizada' : 'Esterilizado';
    if (a.sterilized === 'no') return female ? 'No esterilizada' : 'No esterilizado';
    return 'Sin datos';
}

const VACCINES_LABEL = {
    al_dia: 'vacunas al día',
    faltan: 'vacunas pendientes',
    no_tiene: 'sin vacunas',
} as const;

export function healthText(a: AnimalDetail): string {
    const sterilized = sterilizedLabel(a);
    if (!a.vaccines) return sterilized;
    return `${sterilized}, ${VACCINES_LABEL[a.vaccines]}`;
}

function joinList(items: string[]): string {
    if (items.length <= 1) return items.join('');
    return `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`;
}

export function conviveText(a: AnimalDetail): string {
    return a.conviveCon.length ? `Se lleva bien con ${joinList(a.conviveCon)}` : 'Sin información';
}

export function idealText(a: AnimalDetail): string {
    if (!a.idealPara.length) return 'Sin información';
    const text = joinList(a.idealPara);
    return text.charAt(0).toUpperCase() + text.slice(1);
}

export const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);