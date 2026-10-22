import type { CSSProperties } from 'react';
import { IonIcon } from '@ionic/react';
import './ChipGroup.css';

export interface ChipOption {
    value: string;
    label: string;
    /** Segunda línea más pequeña (por ejemplo "0-10 kg"). */
    hint?: string;
    /** Ícono de ionicons. */
    icon?: string;
    /** SVG propio de un solo color: se tiñe con el color del texto. */
    img?: string;
}

type Base = {
    /** Mismo id que se le pasó al <Field> que lo contiene. */
    id: string;
    options: ChipOption[];
    error?: string;
    /** El <Field> tiene texto de ayuda. */
    hasHint?: boolean;
    /**
     * equal: columnas iguales (todas en una fila).
     * pairs: 2 columnas en móvil y fila libre en desktop.
     * auto: cada chip con su ancho.
     */
    layout?: 'equal' | 'pairs' | 'auto';
    /** Ancho de cada chip en desktop cuando layout es "equal". */
    chipWidth?: string;
};
type Single = Base & { multiple?: false; value: string; onChange: (value: string) => void };
type Multi = Base & { multiple: true; value: string[]; onChange: (value: string[]) => void };

/** Botones seleccionables: uno solo (radio) o varios (checkbox). */
export default function ChipGroup(props: Single | Multi) {
    const { id, options, error, hasHint, layout = 'auto', chipWidth } = props;

    const isOn = (value: string) => (props.multiple ? props.value.includes(value) : props.value === value);

    const pick = (value: string) => {
        if (props.multiple) {
            props.onChange(
                props.value.includes(value) ? props.value.filter((v) => v !== value) : [...props.value, value],
            );
        } else {
            props.onChange(value);
        }
    };

    const describedBy = [hasHint ? `${id}-hint` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ');

    return (
        <div
            id={id}
            className={`pub-chips pub-chips--${layout}`}
            style={{ '--cols': options.length, '--chip-w': chipWidth } as CSSProperties}
            role={props.multiple ? 'group' : 'radiogroup'}
            aria-labelledby={`${id}-label`}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy || undefined}
            tabIndex={-1}
        >
            {options.map((o) => (
                <label key={o.value} className="pub-chip">
                    <input
                        type={props.multiple ? 'checkbox' : 'radio'}
                        name={id}
                        value={o.value}
                        checked={isOn(o.value)}
                        onChange={() => pick(o.value)}
                    />
                    <span className="pub-chip__body">
                        {o.icon && <IonIcon icon={o.icon} className="pub-chip__icon" aria-hidden="true" />}
                        {o.img && (
                            <span
                                className="pub-chip__mask"
                                style={{ '--icon': `url("${o.img}")` } as CSSProperties}
                                aria-hidden="true"
                            />
                        )}
                        <span className="pub-chip__text">
                            <span className="pub-chip__label">{o.label}</span>
                            {o.hint && <span className="pub-chip__hint">{o.hint}</span>}
                        </span>
                    </span>
                </label>
            ))}
        </div>
    );
}
