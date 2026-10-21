import { IonIcon } from '@ionic/react';
import { chevronDown } from 'ionicons/icons';
import './forms.css';

export type SelectOption = string | { value: string; label: string };

interface SelectProps {
    value: string;
    options: SelectOption[];
    onChange: (value: string) => void;
    /** id y atributos aria que entrega la página (ver `aria()` en cada formulario). */
    aria: object;
    placeholder?: string;
}

export default function Select({
    value,
    options,
    onChange,
    aria,
    placeholder = 'Selecciona una opción',
}: SelectProps) {
    return (
        <div className="form-select">
            <select
                {...aria}
                className={`form-input${value ? '' : ' is-empty'}`}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                <option value="">{placeholder}</option>
                {options.map((o) => {
                    const { value: v, label } = typeof o === 'string' ? { value: o, label: o } : o;
                    return (
                        <option key={v} value={v}>
                            {label}
                        </option>
                    );
                })}
            </select>
            <IonIcon icon={chevronDown} aria-hidden="true" />
        </div>
    );
}
