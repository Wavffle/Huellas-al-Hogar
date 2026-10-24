import { useEffect, useState } from 'react';
import { getContenidos, type Contenido } from '../../services/contenidoService';
import './ArticlesSection.css';

interface Props {
    categoria: string;
    title: string;
}

export default function ArticlesSection({ categoria, title }: Props) {
    const [articles, setArticles] = useState<Contenido[]>([]);

    useEffect(() => {
        let cancelled = false;
        getContenidos(categoria)
            .then((list) => !cancelled && setArticles(list))
            .catch(() => !cancelled && setArticles([]));
        return () => {
            cancelled = true;
        };
    }, [categoria]);

    if (articles.length === 0) return null;

    return (
        <section className="art-section" aria-labelledby={`art-${categoria}`}>
            <h2 id={`art-${categoria}`} className="art-section__title">
                {title}
            </h2>
            <ul className="art-list">
                {articles.map((a) => (
                    <li key={a.id}>
                        <details className="art-item">
                            <summary className="art-item__title">{a.titulo}</summary>
                            <div className="art-item__body selectable">
                                {a.contenido
                                    .split(/\n+/)
                                    .filter((line) => line.trim())
                                    .map((line, i) => (
                                        <p key={i}>{line}</p>
                                    ))}
                            </div>
                        </details>
                    </li>
                ))}
            </ul>
        </section>
    );
}