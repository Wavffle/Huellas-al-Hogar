import type { ReactNode } from 'react';
import './forms.css';

interface FieldProps {
    /** id del control. La etiqueta usa `${id}-label`, la ayuda `${id}-hint` y el error `${id}-error`. */
    id: string;
    label: string;
    error?: string;
    hint?: string;
    full?: boolean;
    /** true cuando el control es un grupo de botones (no un input con label asociado). */
    group?: boolean;
    /** 'required' muestra *, 'optional' muestra "(opcional)", 'none' no muestra nada. */
    mark?: 'required' | 'optional' | 'none';
    className?: string;
    children: ReactNode;
}

export default function Field({
    id,
    label,
    error,
    hint,
    full,
    group,
    mark = 'required',
    className = '',
    children,
}: FieldProps) {
    const text = (
        <>
            {label}
            {mark === 'required' && (
                <>
                    {' '}
                    <span className="form-required" aria-hidden="true">
                        *
                    </span>
                </>
            )}
            {mark === 'optional' && (
                <>
                    {' '}
                    <span className="form-optional">(opcional)</span>
                </>
            )}
        </>
    );

    const classes = ['form-field', full && 'form-field--full', group && 'form-field--choice', className]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={classes}>
            {group ? (
                <span id={`${id}-label`} className="form-label">
                    {text}
                </span>
            ) : (
                <label htmlFor={id} className="form-label">
                    {text}
                </label>
            )}
            {children}
            {hint && (
                <p id={`${id}-hint`} className="form-hint selectable">
                    {hint}
                </p>
            )}
            {error && (
                <p id={`${id}-error`} className="form-error" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}
