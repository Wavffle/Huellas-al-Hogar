import './forms.css';

interface ChoiceProps {
    /** Mismo id que se le pasó al <Field> que lo contiene. */
    id: string;
    value: string;
    options: string[];
    error?: string;
    onChange: (value: string) => void;
}

/** Botones de elección única (radio). Para pocas opciones, como Sí/No. */
export default function Choice({ id, value, options, error, onChange }: ChoiceProps) {
    return (
        <div
            id={id}
            className="form-choice"
            role="radiogroup"
            aria-labelledby={`${id}-label`}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            tabIndex={-1}
        >
            {options.map((o) => (
                <label key={o} className="form-choice__option">
                    <input type="radio" name={id} value={o} checked={value === o} onChange={() => onChange(o)} />
                    <span>{o}</span>
                </label>
            ))}
        </div>
    );
}
