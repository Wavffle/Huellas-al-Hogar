import { IonIcon } from '@ionic/react';
import {
    femaleOutline,
    heartOutline,
    helpCircleOutline,
    homeOutline,
    informationCircleOutline,
    maleOutline,
    pawOutline,
    peopleOutline,
} from 'ionicons/icons';
import Field from '../forms/Field';
import Select from '../forms/Select';
import ChipGroup, { type ChipOption } from './ChipGroup';
import { CIUDADES } from '../../data/ciudades';
import { EDAD_OPTIONS, ESPECIES, LIMITES, ORIGENES, SEXOS, type PublishValues } from '../../data/publish';
import { ariaFor, fid, type StepProps } from './publishForm';
import iconPerro from '../../assets/icons/publicar-perro.svg';
import iconGato from '../../assets/icons/publicar-gato.svg';
import './PublishFields.css';

const ESPECIE_CHIPS: ChipOption[] = ESPECIES.map((o) => ({
    ...o,
    ...(o.value === 'perro' ? { img: iconPerro } : o.value === 'gato' ? { img: iconGato } : { icon: helpCircleOutline }),
}));

const SEXO_CHIPS: ChipOption[] = SEXOS.map((o) => ({
    ...o,
    icon: o.value === 'macho' ? maleOutline : femaleOutline,
}));

const ORIGEN_ICON: Record<string, string> = {
    RESCATE: heartOutline,
    ENTREGADO_FAMILIA: peopleOutline,
    REFUGIO: homeOutline,
    CAMADA: pawOutline,
};
const ORIGEN_CHIPS: ChipOption[] = ORIGENES.map((o) => ({ ...o, icon: ORIGEN_ICON[o.value] }));

export default function StepBasic({ values, errors, set }: StepProps) {
    return (
        <div className="pub-fields">
            <Field
                id={fid('nombre')}
                label="Nombre del animal"
                mark="none"
                error={errors.nombre}
                hint="Si no tiene un nombre aún, puedes poner uno temporal"
            >
                <input
                    {...ariaFor('nombre', errors, true)}
                    className="form-input"
                    type="text"
                    maxLength={LIMITES.nombre}
                    placeholder="Ej. Luna"
                    autoComplete="off"
                    value={values.nombre}
                    onChange={(e) => set('nombre', e.target.value)}
                />
            </Field>

            <Field id={fid('especie')} label="Especie" mark="none" group error={errors.especie}>
                <ChipGroup
                    id={fid('especie')}
                    layout="equal"
                    options={ESPECIE_CHIPS}
                    value={values.especie}
                    error={errors.especie}
                    onChange={(v) => set('especie', v as PublishValues['especie'])}
                />
            </Field>

            <Field id={fid('sexo')} label="Sexo" mark="none" group error={errors.sexo}>
                <ChipGroup
                    id={fid('sexo')}
                    layout="equal"
                    options={SEXO_CHIPS}
                    value={values.sexo}
                    error={errors.sexo}
                    onChange={(v) => set('sexo', v as PublishValues['sexo'])}
                />
            </Field>

            <Field id={fid('edadMeses')} label="Edad aproximada" mark="none" error={errors.edadMeses} className="pub-half">
                <Select
                    aria={ariaFor('edadMeses', errors)}
                    value={values.edadMeses}
                    options={EDAD_OPTIONS}
                    onChange={(v) => set('edadMeses', v)}
                />
            </Field>

            <Field
                id={fid('ciudad')}
                label="Ciudad donde se encuentra"
                mark="none"
                error={errors.ciudad}
                className="pub-half"
            >
                <Select
                    aria={ariaFor('ciudad', errors)}
                    value={values.ciudad}
                    options={CIUDADES}
                    onChange={(v) => set('ciudad', v)}
                />
            </Field>

            <Field id={fid('origen')} label="Origen" mark="none" group error={errors.origen}>
                <ChipGroup
                    id={fid('origen')}
                    layout="pairs"
                    options={ORIGEN_CHIPS}
                    value={values.origen}
                    error={errors.origen}
                    onChange={(v) => set('origen', v as PublishValues['origen'])}
                />
            </Field>

            <aside className="pub-note">
                <IonIcon icon={informationCircleOutline} aria-hidden="true" />
                <p className="selectable">
                    Publica <strong>solo si tienes autorización</strong> y si el animal se encuentra en una
                    situación segura. La información será revisada <strong>antes de ser publicada</strong>.
                </p>
            </aside>
        </div>
    );
}
