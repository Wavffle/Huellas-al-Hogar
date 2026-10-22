import { IonIcon } from '@ionic/react';
import { calendarOutline } from 'ionicons/icons';
import './DateInput.css';

interface DateInputProps {
    /** Fecha en formato AAAA-MM-DD (vacío si no hay). */
    value: string;
    onChange: (value: string) => void;
    aria: object;
    /** Fecha máxima permitida (AAAA-MM-DD). */
    max?: string;
    disabled?: boolean;
}

export default function DateInput({ value, onChange, aria, max, disabled }: DateInputProps) {
    return (
        <div className={`form-date${disabled ? ' is-disabled' : ''}`}>
            <input
                {...aria}
                type="date"
                className={`form-input${value ? '' : ' is-empty'}`}
                value={value}
                max={max}
                disabled={disabled}
                onChange={(e) => onChange(e.target.value)}
                onClick={(e) => {
                    // Abre el calendario al hacer clic en cualquier parte del campo
                    try {
                        e.currentTarget.showPicker?.();
                    } catch {
                        /* el navegador no permite abrirlo desde aquí */
                    }
                }}
            />
            <IonIcon icon={calendarOutline} aria-hidden="true" />
        </div>
    );
}
