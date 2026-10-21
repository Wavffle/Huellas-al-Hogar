import type { ReactNode } from 'react';
import './forms.css';

interface FieldProps {
    id: string;
    label: string;
    error?: string;
    full?: boolean;
    group?: boolean;
    mark?: 'required' | 'optional' | 'none';
    className?: string;
    children: ReactNode;
}

export default function Field({
    id,
    label,
    error,
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
            {error && (
                <p id={`${id}-error`} className="form-error" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}
