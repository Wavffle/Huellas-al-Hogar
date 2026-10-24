import { formatAge } from '../components/adoptions/adoptionUtils';

/* ===== Pasos del asistente ===== */
export interface PublishStepMeta {
    id: string;
    /** Texto del menú lateral. */
    label: string;
    /** Título y subtítulo del panel. */
    title: string;
    subtitle: string;
}

export const PUBLISH_STEPS: PublishStepMeta[] = [
    {
        id: 'basica',
        label: 'Información básica',
        title: 'Información básica',
        subtitle: 'Comencemos con algunos datos generales sobre el animal y su estado.',
    },
    {
        id: 'caracteristicas',
        label: 'Características del animal',
        title: 'Características del animal',
        subtitle: 'Cuéntanos más sobre su tamaño, personalidad y convivencia.',
    },
    {
        id: 'salud',
        label: 'Salud y cuidados',
        title: 'Salud y cuidados',
        subtitle:
            'Comparte información importante sobre su salud actual y los cuidados que necesita para que su nueva familia esté preparada.',
    },
    {
        id: 'fotos',
        label: 'Fotos y descripción',
        title: 'Fotos y descripción',
        subtitle: 'Agrega fotos del animal y una descripción que ayude a las personas a conocerlo mejor.',
    },
    {
        id: 'revision',
        label: 'Revisión y publicación',
        title: 'Revisión y publicación',
        subtitle: 'Revisa que toda la información sea correcta antes de publicar el perfil del animal.',
    },
];

/* ===== Opciones ===== */
export type Option<T extends string = string> = { value: T; label: string };

export type Especie = 'perro' | 'gato' | 'otro';
export type Sexo = 'macho' | 'hembra';
export type Tamano = 'pequeño' | 'mediano' | 'grande';
export type Origen = 'RESCATE' | 'ENTREGADO_FAMILIA' | 'REFUGIO' | 'CAMADA';
export type Vacunas = 'AL_DIA' | 'FALTAN' | 'NO_TIENE';
export type Esterilizado = 'SI' | 'NO' | 'NO_SABE';

export const ESPECIES: Option<Especie>[] = [
    { value: 'perro', label: 'Perro' },
    { value: 'gato', label: 'Gato' },
    { value: 'otro', label: 'Otro' },
];

export const SEXOS: Option<Sexo>[] = [
    { value: 'macho', label: 'Macho' },
    { value: 'hembra', label: 'Hembra' },
];

export const TAMANOS: (Option<Tamano> & { hint: string })[] = [
    { value: 'pequeño', label: 'Pequeño', hint: '0-10 kg' },
    { value: 'mediano', label: 'Mediano', hint: '10-25 kg' },
    { value: 'grande', label: 'Grande', hint: '+ 25 kg' },
];

export const ORIGENES: Option<Origen>[] = [
    { value: 'RESCATE', label: 'Rescate' },
    { value: 'ENTREGADO_FAMILIA', label: 'Entregado por su familia' },
    { value: 'REFUGIO', label: 'Refugio o fundación' },
    { value: 'CAMADA', label: 'Camada' },
];

export const VACUNAS: Option<Vacunas>[] = [
    { value: 'AL_DIA', label: 'Al día' },
    { value: 'FALTAN', label: 'Faltan algunas' },
    { value: 'NO_TIENE', label: 'No tiene' },
];

export const ESTERILIZACION: Option<Esterilizado>[] = [
    { value: 'SI', label: 'Sí' },
    { value: 'NO', label: 'No' },
    { value: 'NO_SABE', label: 'No se sabe' },
];

/** Edad en meses: 1 a 11 meses y luego años completos (1 a 20). El valor guardado son los meses. */
export const EDAD_OPTIONS: Option[] = [
    ...Array.from({ length: 11 }, (_, i) => i + 1),
    ...Array.from({ length: 20 }, (_, i) => (i + 1) * 12),
].map((months) => ({ value: String(months), label: formatAge(months) }));

/** Se guardan en minúscula: el detalle arma "Se lleva bien con perros, gatos y niños". */
export const CONVIVE_CON: Option[] = [
    { value: 'perros', label: 'Perros' },
    { value: 'gatos', label: 'Gatos' },
    { value: 'niños', label: 'Niños' },
];

/** Se guardan en minúscula: el detalle muestra "Familias, personas activas". */
export const IDEAL_PARA: Option[] = [
    { value: 'familias', label: 'Familias' },
    { value: 'personas activas', label: 'Personas activas' },
    { value: 'personas solas', label: 'Personas solas' },
    { value: 'adultos mayores', label: 'Adultos mayores' },
    { value: 'casa con patio', label: 'Casa con patio' },
    { value: 'departamento', label: 'Departamento' },
];

/** Etiquetas: el texto guardado depende del sexo (Juguetón / Juguetona). */
export interface EtiquetaOption {
    id: string;
    m: string;
    f: string;
    /** Prefijo solo del chip ("Es juguetón"). */
    prefix?: string;
}

export const ETIQUETAS: EtiquetaOption[] = [
    { id: 'entrenamiento', m: 'Entrenamiento básico', f: 'Entrenamiento básico' },
    { id: 'jugueton', m: 'Juguetón', f: 'Juguetona', prefix: 'Es ' },
    { id: 'tranquilo', m: 'Tranquilo', f: 'Tranquila' },
    { id: 'independiente', m: 'Independiente', f: 'Independiente' },
    { id: 'carinoso', m: 'Cariñoso', f: 'Cariñosa' },
    { id: 'sociable', m: 'Sociable', f: 'Sociable' },
];

/* ===== Límites ===== */
export const MAX_FOTOS = 5;
export const MAX_FOTO_MB = 5;
export const FOTO_TIPOS = ['image/jpeg', 'image/png', 'image/webp'];

export const LIMITES = {
    nombre: 40,
    personalidad: 500,
    descripcion: 800,
    vacunasDetalles: 250,
    cuidadoEspecial: 250,
    razonAdopcion: 250,
} as const;

/* ===== Valores del formulario ===== */
export interface FotoItem {
    id: string;
    /** Solo en fotos nuevas. Las que ya están guardadas no tienen archivo. */
    file?: File;
    /** URL local (URL.createObjectURL) o la del servidor, para la vista previa. */
    url: string;
    /** id de la foto en el servidor (solo en modo edición). */
    serverId?: number;
}

export interface PublishValues {
    // 1. Información básica
    nombre: string;
    especie: Especie | '';
    sexo: Sexo | '';
    edadMeses: string;
    ciudad: string;
    origen: Origen | '';
    // 2. Características
    tamano: Tamano | '';
    conviveCon: string[];
    idealPara: string[];
    personalidad: string;
    // 3. Salud y cuidados
    vacunas: Vacunas | '';
    vacunasDetalles: string;
    esterilizado: Esterilizado | '';
    fechaEsterilizacion: string;
    cuidadoEspecial: string;
    // 4. Fotos y descripción
    fotos: FotoItem[];
    descripcion: string;
    razonAdopcion: string;
    etiquetas: string[];
    // 5. Revisión
    acepta: boolean;
}

export const INITIAL_PUBLISH_VALUES: PublishValues = {
    nombre: '',
    especie: '',
    sexo: '',
    edadMeses: '',
    ciudad: '',
    origen: '',
    tamano: '',
    conviveCon: [],
    idealPara: [],
    personalidad: '',
    vacunas: '',
    vacunasDetalles: '',
    esterilizado: '',
    fechaEsterilizacion: '',
    cuidadoEspecial: '',
    fotos: [],
    descripcion: '',
    razonAdopcion: '',
    etiquetas: [],
    acepta: false,
};
