import type { AnimalDetail } from '../adoptions/adoptionDetail';
import type { Sex, Size, Species } from '../../data/adoptions';
import { ETIQUETAS, type PublishValues } from '../../data/publish';
import { resolveImage } from '../adoptions/adoptionMapper';

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** Textos de las etiquetas según el sexo ("Juguetón" / "Juguetona"), en el orden del formulario. */
export function etiquetaTexts(values: Pick<PublishValues, 'etiquetas' | 'sexo'>): string[] {
    const female = values.sexo === 'hembra';
    return ETIQUETAS.filter((e) => values.etiquetas.includes(e.id)).map((e) => (female ? e.f : e.m));
}

/**
 * Convierte el formulario en el mismo objeto que usa la página de detalle, para que la vista previa
 * use exactamente los mismos textos que se verán al publicar.
 */
export function valuesToDetail(v: PublishValues): AnimalDetail {
    const photos = v.fotos.map((f) => f.url);
    return {
        id: 'vista-previa',
        name: v.nombre.trim() || 'Sin nombre',
        species: (v.especie || 'perro') as Species,
        ageMonths: Number(v.edadMeses) || 0,
        size: (v.tamano || 'mediano') as Size,
        sex: (v.sexo || 'macho') as Sex,
        city: v.ciudad,
        image: photos[0] ?? '',
        photos,
        status: 'EN_ADOPCION',
        origin: v.origen,
        description: v.descripcion.trim(),
        sterilized: v.esterilizado === 'SI' ? 'si' : v.esterilizado === 'NO' ? 'no' : 'no_sabe',
        vaccines:
            v.vacunas === 'AL_DIA'
                ? 'al_dia'
                : v.vacunas === 'FALTAN'
                    ? 'faltan'
                    : v.vacunas === 'NO_TIENE'
                        ? 'no_tiene'
                        : '',
        conviveCon: v.conviveCon,
        idealPara: v.idealPara,
        ownerId: null,
        tags: etiquetaTexts(v),
    };
}

/**
 * Campos de POST /api/animales con los nombres de las columnas de la tabla `animales`.
 * El backend rechaza (400) cualquier campo que no conozca y los textos vacíos,
 * por eso los opcionales y las listas vacías se omiten (al crear, el backend los guarda como null).
 * Las fotos NO van aquí: viajan aparte en buildFormData.
 */
/**
 * Campos de POST/PATCH /api/animales con los nombres de las columnas de la tabla `animales`.
 * Al crear, los opcionales vacíos se omiten. Al editar (`edit`) se envían vacíos para que el
 * backend los guarde como null; si no, un dato borrado seguiría en la base.
 * El estado NO se envía: lo decide el servidor. Las fotos viajan aparte, en buildFormData.
 */
export function buildPayload(v: PublishValues, edit = false): Record<string, unknown> {
    const meses = Number(v.edadMeses);
    const payload: Record<string, unknown> = {
        nombre: v.nombre.trim(),
        especie: v.especie,
        sexo: capitalize(v.sexo),
        tamanho: capitalize(v.tamano),
        edad: Math.floor(meses / 12),
        edad_meses: meses,
        ciudad: v.ciudad,
        rescate: v.origen,
        descripcion: v.descripcion.trim(),
        personalidad: v.personalidad.trim(),
        vacunas_estado: v.vacunas,
        esterilizado: v.esterilizado,
    };

    const lists: Record<string, string[]> = {
        ideal_para: v.idealPara,
        convive_con: v.conviveCon,
        etiquetas: etiquetaTexts(v),
    };
    for (const [key, items] of Object.entries(lists)) {
        if (edit || items.length > 0) payload[key] = items;
    }

    const optional: Record<string, string> = {
        cuidado_especial: v.cuidadoEspecial.trim(),
        razon_adopcion: v.razonAdopcion.trim(),
        vacunas_detalles: v.vacunas === 'NO_TIENE' ? '' : v.vacunasDetalles.trim(),
        fecha_esterilizacion: v.esterilizado === 'SI' ? v.fechaEsterilizacion : '',
    };
    for (const [key, value] of Object.entries(optional)) {
        if (edit || value) payload[key] = value;
    }
    return payload;
}

/**
 * Mismo contenido que buildPayload más las fotos, en multipart/form-data (lo que lee multer).
 * Las listas van como texto separado por comas. En modo edición se indica además cuáles
 * fotos del servidor se conservan (fotos_conservar) y solo se suben las nuevas.
 */
export function buildFormData(v: PublishValues, { edit = false } = {}): FormData {
    const data = new FormData();
    for (const [key, value] of Object.entries(buildPayload(v, edit))) {
        data.append(key, Array.isArray(value) ? value.join(',') : String(value));
    }
    v.fotos.forEach((foto) => {
        if (foto.file) data.append('fotos', foto.file, foto.file.name);
    });
    if (edit) {
        const conservar = v.fotos.filter((f) => f.serverId !== undefined).map((f) => f.serverId);
        data.append('fotos_conservar', conservar.join(','));
    }
    return data;
}

/* ===== Edición: del animal del backend a los valores del formulario ===== */
const plain = (t: unknown) =>
    String(t ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();

/** La fecha llega como ISO con hora; se toma el día en hora local (igual que todayISO). */
function localDate(value: unknown): string {
    if (!value) return '';
    const text = String(value);
    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
    const d = new Date(text);
    if (Number.isNaN(d.getTime())) return '';
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function animalToValues(raw: any): PublishValues {
    const especie = plain(raw.especie);
    const sexo = plain(raw.sexo);
    const tamano = plain(raw.tamanho);
    const meses = raw.edad_meses != null ? Number(raw.edad_meses) : Math.round(Number(raw.edad ?? 0) * 12);
    const etiquetasGuardadas: string[] = Array.isArray(raw.etiquetas) ? raw.etiquetas.map(String) : [];

    return {
        nombre: raw.nombre ?? '',
        especie: especie.startsWith('gat') ? 'gato' : especie.startsWith('perr') ? 'perro' : 'otro',
        sexo: sexo === 'hembra' ? 'hembra' : sexo === 'macho' ? 'macho' : '',
        edadMeses: meses > 0 ? String(meses) : '',
        ciudad: raw.ciudad ?? '',
        origen: raw.rescate ?? '',
        tamano: tamano === 'pequeno' ? 'pequeño' : tamano === 'grande' ? 'grande' : tamano === 'mediano' ? 'mediano' : '',
        conviveCon: Array.isArray(raw.convive_con) ? raw.convive_con.map(String) : [],
        idealPara: Array.isArray(raw.ideal_para) ? raw.ideal_para.map(String) : [],
        personalidad: raw.personalidad ?? '',
        vacunas: raw.vacunas_estado ?? '',
        vacunasDetalles: raw.vacunas_detalles ?? '',
        esterilizado: raw.esterilizado ?? '',
        fechaEsterilizacion: localDate(raw.fecha_esterilizacion),
        cuidadoEspecial: raw.cuidado_especial ?? '',
        fotos: [...(raw.fotos ?? [])]
            .sort((a, b) => (a?.orden ?? 0) - (b?.orden ?? 0))
            .map((f) => ({ id: `srv-${f.id}`, serverId: Number(f.id), url: resolveImage(String(f.imagen_url)) })),
        descripcion: raw.descripcion ?? '',
        razonAdopcion: raw.razon_adopcion ?? '',
        // Se guardan como texto ("Juguetona"); el formulario usa ids
        etiquetas: ETIQUETAS.filter((e) => etiquetasGuardadas.includes(e.m) || etiquetasGuardadas.includes(e.f)).map(
            (e) => e.id,
        ),
        acepta: true, // ya aceptó los términos al publicar
    };
}