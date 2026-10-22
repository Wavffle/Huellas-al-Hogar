import {
    accessibilityOutline,
    businessOutline,
    leafOutline,
    peopleOutline,
    personOutline,
    walkOutline,
} from 'ionicons/icons';
import Field from '../forms/Field';
import TextArea from '../forms/TextArea';
import ChipGroup, { type ChipOption } from './ChipGroup';
import { CONVIVE_CON, IDEAL_PARA, LIMITES, TAMANOS, type PublishValues } from '../../data/publish';
import { ariaFor, fid, type StepProps } from './publishForm';
import iconPerro from '../../assets/icons/publicar-perro.svg';
import iconGato from '../../assets/icons/publicar-gato.svg';
import iconNinos from '../../assets/icons/publicar-ninos.svg';
import iconPequeno from '../../assets/icons/publicar-tamano-pequeno.svg';
import iconMediano from '../../assets/icons/publicar-tamano-mediano.svg';
import iconGrande from '../../assets/icons/publicar-tamano-grande.svg';
import './PublishFields.css';

const TAMANO_ICON: Record<string, string> = {
    pequeño: iconPequeno,
    mediano: iconMediano,
    grande: iconGrande,
};
const TAMANO_CHIPS: ChipOption[] = TAMANOS.map((o) => ({ ...o, img: TAMANO_ICON[o.value] }));

const CONVIVE_ICON: Record<string, { img: string }> = {
    perros: { img: iconPerro },
    gatos: { img: iconGato },
    niños: { img: iconNinos },
};
const CONVIVE_CHIPS: ChipOption[] = CONVIVE_CON.map((o) => ({ ...o, ...CONVIVE_ICON[o.value] }));

const IDEAL_ICON: Record<string, string> = {
    familias: peopleOutline,
    'personas activas': walkOutline,
    'personas solas': personOutline,
    'adultos mayores': accessibilityOutline,
    'casa con patio': leafOutline,
    departamento: businessOutline,
};
const IDEAL_CHIPS: ChipOption[] = IDEAL_PARA.map((o) => ({ ...o, icon: IDEAL_ICON[o.value] }));

export default function StepFeatures({ values, errors, set }: StepProps) {
    return (
        <div className="pub-fields">
            <Field id={fid('tamano')} label="Tamaño" mark="none" group error={errors.tamano}>
                <ChipGroup
                    id={fid('tamano')}
                    layout="equal"
                    chipWidth="10.6rem"
                    options={TAMANO_CHIPS}
                    value={values.tamano}
                    error={errors.tamano}
                    onChange={(v) => set('tamano', v as PublishValues['tamano'])}
                />
            </Field>

            <Field
                id={fid('conviveCon')}
                label="Convive bien con"
                mark="optional"
                group
                hint="Puedes elegir más de una opción."
            >
                <ChipGroup
                    multiple
                    hasHint
                    id={fid('conviveCon')}
                    options={CONVIVE_CHIPS}
                    value={values.conviveCon}
                    onChange={(v) => set('conviveCon', v)}
                />
            </Field>

            <Field
                id={fid('idealPara')}
                label="Ideal para"
                mark="optional"
                group
                hint="Puedes elegir más de una opción."
            >
                <ChipGroup
                    multiple
                    hasHint
                    id={fid('idealPara')}
                    options={IDEAL_CHIPS}
                    value={values.idealPara}
                    onChange={(v) => set('idealPara', v)}
                />
            </Field>

            <Field
                id={fid('personalidad')}
                label="Comportamiento y personalidad"
                mark="none"
                error={errors.personalidad}
            >
                <TextArea
                    aria={ariaFor('personalidad', errors)}
                    max={LIMITES.personalidad}
                    value={values.personalidad}
                    placeholder="Ej. es cariñoso, juguetón, tranquilo, le gusta pasear, etc."
                    onChange={(v) => set('personalidad', v)}
                />
            </Field>
        </div>
    );
}
