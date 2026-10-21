import './forms.css';

interface TextAreaProps {
    value: string;
    placeholder: string;
    onChange: (value: string) => void;
    aria: object;
    /** Límite de caracteres (también se muestra en el contador). */
    max?: number;
}

export default function TextArea({ value, placeholder, onChange, aria, max = 250 }: TextAreaProps) {
    return (
        <div className="form-textarea">
            <textarea
                {...aria}
                className="form-input"
                maxLength={max}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
            <span className="form-count">
                {value.length}/{max}
            </span>
        </div>
    );
}
