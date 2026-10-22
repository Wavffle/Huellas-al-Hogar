import { banOutline, helpCircleOutline } from 'ionicons/icons';
import Field from '../forms/Field';
import TextArea from '../forms/TextArea';
import DateInput from '../forms/DateInput';
import ChipGroup, { type ChipOption } from './ChipGroup';
import { ESTERILIZACION, LIMITES, VACUNAS, type PublishValues } from '../../data/publish';
import { ariaFor, fid, todayISO, type StepProps } from './publishForm';
import iconJeringa from '../../assets/icons/publicar-jeringa.svg';
import './PublishFields.css';

const VACUNA_CHIPS: ChipOption[] = VACUNAS.map((o) =>
    o.value === 'NO_TIENE' ? { ...o, icon: banOutline } : { ...o, img: iconJeringa },
);

const ESTERILIZACION_CHIPS: ChipOption[] = ESTERILIZACION.map((o) =>
    o.value === 'NO_SABE' ? { ...o, icon: helpCircleOutline } : o,
);

export default function StepHealth({ values, errors, set }: StepProps) {
    const canHaveDate = values.esterilizado === 'SI';

    return (
        <div className="pub-fields pub-fields--health">
            <Field id={fid('vacunas')} label="Vacunas" mark="none" group error={errors.vacunas} className="pub-half">
                <ChipGroup
                    id={fid('vacunas')}
                    chipWidth="8rem"
                    options={VACUNA_CHIPS}
                    value={values.vacunas}
                    error={errors.vacunas}
                    onChange={(v) => set('vacunas', v as PublishValues['vacunas'])}
                />
            </Field>

            <Field
                id={fid('vacunasDetalles')}
                label="Especifica cuáles tiene"
                mark="optional"
                className="pub-half pub-short"
            >
                <TextArea
                    aria={ariaFor('vacunasDetalles', errors)}
                    max={LIMITES.vacunasDetalles}
                    value={values.vacunasDetalles}
                    placeholder="Ej. Vacuna triple felina, antirrábica, etc."
                    onChange={(v) => set('vacunasDetalles', v)}
                />
            </Field>

            <Field
                id={fid('esterilizado')}
                label="Esterilización"
                mark="none"
                group
                error={errors.esterilizado}
                className="pub-half"
            >
                <ChipGroup
                    id={fid('esterilizado')}
                    chipWidth="8rem"
                    options={ESTERILIZACION_CHIPS}
                    value={values.esterilizado}
                    error={errors.esterilizado}
                    onChange={(v) => {
                        set('esterilizado', v as PublishValues['esterilizado']);
                        // La fecha solo tiene sentido si está esterilizado
                        if (v !== 'SI') set('fechaEsterilizacion', '');
                    }}
                />
            </Field>

            <Field
                id={fid('fechaEsterilizacion')}
                label="Fecha de esterilización"
                mark="optional"
                error={errors.fechaEsterilizacion}
                className="pub-half pub-date"
            >
                <DateInput
                    aria={ariaFor('fechaEsterilizacion', errors)}
                    value={values.fechaEsterilizacion}
                    max={todayISO()}
                    disabled={!canHaveDate}
                    onChange={(v) => set('fechaEsterilizacion', v)}
                />
            </Field>

            <Field id={fid('cuidadoEspecial')} label="Cuidados especiales" mark="optional">
                <TextArea
                    aria={ariaFor('cuidadoEspecial', errors)}
                    max={LIMITES.cuidadoEspecial}
                    value={values.cuidadoEspecial}
                    placeholder="Ej. Dieta especial, medicación, controles veterinarios, etc."
                    onChange={(v) => set('cuidadoEspecial', v)}
                />
            </Field>
        </div>
    );
}
