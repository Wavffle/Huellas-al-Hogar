import { heartOutline, happyOutline, homeOutline, moonOutline, peopleOutline, schoolOutline } from 'ionicons/icons';
import Field from '../forms/Field';
import TextArea from '../forms/TextArea';
import ChipGroup, { type ChipOption } from './ChipGroup';
import PhotoUploader from './PhotoUploader';
import { ETIQUETAS, LIMITES, MAX_FOTOS, MAX_FOTO_MB } from '../../data/publish';
import { ariaFor, fid, type StepProps } from './publishForm';
import './PublishFields.css';

const ETIQUETA_ICON: Record<string, string> = {
    entrenamiento: schoolOutline,
    jugueton: happyOutline,
    tranquilo: moonOutline,
    independiente: homeOutline,
    carinoso: heartOutline,
    sociable: peopleOutline,
};

export default function StepPhotos({ values, errors, set }: StepProps) {
    // "Es juguetona", "Tranquila", "Cariñosa"… según el sexo elegido en el paso 1
    const female = values.sexo === 'hembra';
    const chips: ChipOption[] = ETIQUETAS.map((e) => {
        const text = female ? e.f : e.m;
        return {
            value: e.id,
            label: e.prefix ? `${e.prefix}${text.toLowerCase()}` : text,
            icon: ETIQUETA_ICON[e.id],
        };
    });

    return (
        <div className="pub-fields">
            <Field
                id={fid('fotos')}
                label="Fotos"
                mark="none"
                group
                error={errors.fotos}
                hint={`La primera foto es la portada. Hasta ${MAX_FOTOS} fotos de ${MAX_FOTO_MB} MB cada una.`}
            >
                <PhotoUploader
                    id={fid('fotos')}
                    hasHint
                    photos={values.fotos}
                    error={errors.fotos}
                    onChange={(photos) => set('fotos', photos)}
                />
            </Field>

            <Field id={fid('descripcion')} label="Descripción" mark="none" error={errors.descripcion}>
                <TextArea
                    aria={ariaFor('descripcion', errors)}
                    max={LIMITES.descripcion}
                    value={values.descripcion}
                    placeholder="Cuéntanos sobre su personalidad, historia, cómo llegó a estar en adopción y cualquier otro detalle importante..."
                    onChange={(v) => set('descripcion', v)}
                />
            </Field>

            <Field id={fid('razonAdopcion')} label="Razón de la adopción" mark="optional">
                <TextArea
                    aria={ariaFor('razonAdopcion', errors)}
                    max={LIMITES.razonAdopcion}
                    value={values.razonAdopcion}
                    placeholder="Ej. Rescate, cambio de domicilio, situación personal."
                    onChange={(v) => set('razonAdopcion', v)}
                />
            </Field>

            <Field
                id={fid('etiquetas')}
                label="Datos adicionales"
                mark="optional"
                group
                hint="Puedes elegir más de una opción."
            >
                <ChipGroup
                    multiple
                    hasHint
                    id={fid('etiquetas')}
                    options={chips}
                    value={values.etiquetas}
                    onChange={(v) => set('etiquetas', v)}
                />
            </Field>
        </div>
    );
}
