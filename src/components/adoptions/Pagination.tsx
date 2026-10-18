import { IonIcon } from '@ionic/react';
import { chevronBack, chevronForward } from 'ionicons/icons';
import './Pagination.css';

function getPages(current: number, total: number): (number | '…')[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | '…')[] = [1];
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    if (start > 2) pages.push('…');
    for (let p = start; p <= end; p++) pages.push(p);
    if (end < total - 1) pages.push('…');
    pages.push(total);
    return pages;
}

interface Props {
    page: number;
    totalPages: number;
    onChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onChange }: Props) {
    if (totalPages <= 1) return null;

    return (
        <nav className="pagination" aria-label="Paginación">
            <button
                type="button"
                className="pagination__arrow"
                aria-label="Página anterior"
                disabled={page === 1}
                onClick={() => onChange(page - 1)}
            >
                <IonIcon icon={chevronBack} />
            </button>

            {getPages(page, totalPages).map((item, i) =>
                item === '…' ? (
                    <span key={`dots-${i}`} className="pagination__dots" aria-hidden="true">
                        …
                    </span>
                ) : (
                    <button
                        key={item}
                        type="button"
                        className={`pagination__page${item === page ? ' pagination__page--current' : ''}`}
                        aria-label={`Página ${item}`}
                        aria-current={item === page ? 'page' : undefined}
                        onClick={() => onChange(item)}
                    >
                        {item}
                    </button>
                ),
            )}

            <button
                type="button"
                className="pagination__arrow"
                aria-label="Página siguiente"
                disabled={page === totalPages}
                onClick={() => onChange(page + 1)}
            >
                <IonIcon icon={chevronForward} />
            </button>
        </nav>
    );
}