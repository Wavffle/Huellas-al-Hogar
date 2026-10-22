import type { PublishValues } from '../../data/publish';

export type Key = keyof PublishValues;
export type Errors = Partial<Record<Key, string>>;

/** Lo que reciben los componentes de cada paso. */
export interface StepProps {
    values: PublishValues;
    errors: Errors;
    set: <K extends Key>(key: K, value: PublishValues[K]) => void;
}

/** id del control de cada campo (lo usan Field, aria y los mensajes de error). */
export const fid = (k: Key) => `pub-${k}`;

/** id y atributos aria de un control. `hasHint` enlaza el texto de ayuda. */
export function ariaFor(k: Key, errors: Errors, hasHint = false) {
    const describedBy = [hasHint ? `${fid(k)}-hint` : '', errors[k] ? `${fid(k)}-error` : '']
        .filter(Boolean)
        .join(' ');
    return {
        id: fid(k),
        'aria-invalid': errors[k] ? (true as const) : undefined,
        'aria-describedby': describedBy || undefined,
    };
}

/** Hoy en formato AAAA-MM-DD con la hora local (toISOString usaría UTC). */
export function todayISO(): string {
    const d = new Date();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
}

/** Campos que valida cada paso. */
export const STEP_KEYS: Key[][] = [
    ['nombre', 'especie', 'sexo', 'edadMeses', 'ciudad', 'origen'],
    ['tamano', 'personalidad'],
    ['vacunas', 'esterilizado', 'fechaEsterilizacion'],
    ['fotos', 'descripcion'],
    ['acepta'],
];

const REQUIRED_TEXT: Key[] = [
    'nombre',
    'especie',
    'sexo',
    'edadMeses',
    'ciudad',
    'origen',
    'tamano',
    'personalidad',
    'vacunas',
    'esterilizado',
    'descripcion',
];
/** Campos que se eligen de una lista (el mensaje cambia). */
const CHOICE_KEYS: Key[] = ['especie', 'sexo', 'edadMeses', 'ciudad', 'origen', 'tamano', 'vacunas', 'esterilizado'];

export function validate(values: PublishValues, keys: Key[]): Errors {
    const errors: Errors = {};
    for (const k of keys) {
        const value = values[k];
        if (REQUIRED_TEXT.includes(k) && typeof value === 'string' && !value.trim()) {
            errors[k] = CHOICE_KEYS.includes(k) ? 'Selecciona una opción.' : 'Este campo es obligatorio.';
        }
    }
    if (keys.includes('nombre') && !errors.nombre && values.nombre.trim().length < 2) {
        errors.nombre = 'El nombre debe tener al menos 2 letras.';
    }
    if (keys.includes('fechaEsterilizacion') && values.fechaEsterilizacion > todayISO()) {
        errors.fechaEsterilizacion = 'La fecha no puede ser futura.';
    }
    if (keys.includes('fotos') && values.fotos.length === 0) {
        errors.fotos = 'Agrega al menos una foto.';
    }
    if (keys.includes('acepta') && !values.acepta) {
        errors.acepta = 'Debes aceptar los términos para publicar.';
    }

    return errors;
}
