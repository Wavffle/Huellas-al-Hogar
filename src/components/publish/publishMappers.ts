import type { AnimalDetail } from '../adoptions/adoptionDetail';
import type { Sex, Size, Species } from '../../data/adoptions';
import { ETIQUETAS, type PublishValues } from '../../data/publish';

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
        tags: etiquetaTexts(v),
    };
}

/**
 * Campos de POST /api/animales con los nombres de las columnas de la tabla `animales`.
 * El backend rechaza (400) cualquier campo que no conozca y los textos vacíos,
 * por eso los opcionales y las listas vacías se omiten (al crear, el backend los guarda como null).
 * Las fotos NO van aquí: viajan aparte en buildFormData.
 */
export function buildPayload(v: PublishValues): Record<string, unknown> {
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
        estado: 'EN_ADOPCION',
    };

    // Listas: solo se envían si tienen elementos
    const lists: Record<string, string[]> = {
        ideal_para: v.idealPara,
        convive_con: v.conviveCon,
        etiquetas: etiquetaTexts(v),
    };
    for (const [key, items] of Object.entries(lists)) {
        if (items.length > 0) payload[key] = items;
    }

    // Campos opcionales: solo se envían si tienen contenido
    const optional: Record<string, string> = {
        cuidado_especial: v.cuidadoEspecial.trim(),
        razon_adopcion: v.razonAdopcion.trim(),
        vacunas_detalles: v.vacunas === 'NO_TIENE' ? '' : v.vacunasDetalles.trim(),
        fecha_esterilizacion: v.esterilizado === 'SI' ? v.fechaEsterilizacion : '',
    };
    for (const [key, value] of Object.entries(optional)) {
        if (value) payload[key] = value;
    }
    return payload;
}

/**
 * Mismo contenido que buildPayload más las fotos, en multipart/form-data (lo que lee multer).
 * Las listas van como texto separado por comas, que es lo que el backend espera, y las fotos
 * como varios archivos "fotos" (la primera es la portada).
 */
export function buildFormData(v: PublishValues): FormData {
    const data = new FormData();
    for (const [key, value] of Object.entries(buildPayload(v))) {
        data.append(key, Array.isArray(value) ? value.join(',') : String(value));
    }
    v.fotos.forEach((foto) => data.append('fotos', foto.file, foto.file.name));
    return data;
}