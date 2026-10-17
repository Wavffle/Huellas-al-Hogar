import './PawLoader.css';

export default function PawLoader({ label = 'Cargando…' }: { label?: string }) {
    return (
        <div className="paw-loader" role="status" aria-live="polite">
            <svg className="paw-loader__svg" viewBox="0 0 100 100" aria-hidden="true">
                {/* Dedos, de izquierda a derecha: el <g> rota y el <ellipse> se anima */}
                <g transform="rotate(-25 14 46)">
                    <ellipse className="paw-loader__toe paw-loader__toe--1" cx="14" cy="46" rx="8" ry="11" />
                </g>
                <g transform="rotate(-10 34 26)">
                    <ellipse className="paw-loader__toe paw-loader__toe--2" cx="34" cy="26" rx="9" ry="12.5" />
                </g>
                <g transform="rotate(10 66 26)">
                    <ellipse className="paw-loader__toe paw-loader__toe--3" cx="66" cy="26" rx="9" ry="12.5" />
                </g>
                <g transform="rotate(25 86 46)">
                    <ellipse className="paw-loader__toe paw-loader__toe--4" cx="86" cy="46" rx="8" ry="11" />
                </g>

                {/* Almohadilla central */}
                <path
                    className="paw-loader__pad"
                    d="M50 46 C33 46 20 62 20 74 C20 86 31 90 40 88 C46 86.5 54 86.5 60 88 C69 90 80 86 80 74 C80 62 67 46 50 46 Z"
                />
            </svg>
            <span className="paw-loader__label">{label}</span>
        </div>
    );
}