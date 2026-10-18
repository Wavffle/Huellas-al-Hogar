import { actions } from '../data/consequences';
import './ActionsSection.css';

/* Manchas moradas de fondo de cada ilustración (2 por ilustración).
   Las coordenadas van de 0 a 100 y son un % del tamaño de la ilustración,
   así que las manchas se mueven y escalan junto con ella. */
const BLOBS: string[][] = [
    // Adopta: detrás del pelo (arriba a la izquierda) y detrás del perro (derecha)
    [
        'M16 62 C12 40 16 16 28 4 C38 -4 52 2 50 20 C48 36 46 52 38 66 C30 74 18 74 16 62 Z',
        'M86 66 C86 56 94 50 100 53 C106 56 104 74 97 80 C91 84 86 80 86 66 Z',
    ],
    // Esteriliza: detrás de la cola del gato (izquierda) y del lomo del perro (derecha)
    [
        'M0 82 C-2 56 6 40 16 38 C26 36 30 48 28 66 C27 78 22 88 12 88 C5 88 1 88 0 82 Z',
        'M76 72 C74 58 80 46 88 44 C96 42 100 52 98 64 C96 76 90 82 82 80 C78 79 76 76 76 72 Z',
    ],
    // Educa: detrás de la cabeza del niño (izquierda) y del gato (derecha)
    [
        'M16 60 C12 36 20 10 36 2 C50 -4 56 10 54 28 C52 44 50 54 42 62 C34 68 20 70 16 60 Z',
        'M82 66 C80 50 84 28 92 24 C100 20 104 40 102 58 C100 72 94 76 88 74 C84 73 82 70 82 66 Z',
    ],
];

export default function ActionsSection() {
    return (
        <section className="aban-act" aria-label="¿Qué podemos hacer?">
            <ul className="aban-act__grid">
                {actions.map((action, index) => (
                    <li key={action.title} className="aban-act-item">
                        <div className="aban-act-item__tile">
                            <div className="aban-act-item__art">
                                <svg
                                    className="aban-act-item__blobs"
                                    viewBox="0 0 100 100"
                                    preserveAspectRatio="none"
                                    aria-hidden="true"
                                >
                                    {(BLOBS[index] ?? []).map((d) => (
                                        <path key={d} d={d} className="aban-act-item__blob" />
                                    ))}
                                </svg>
                                <img src={action.image} alt={action.alt} loading="lazy" />
                            </div>
                        </div>
                        <h3 className="aban-act-item__title">{action.title}</h3>
                        <p className="aban-act-item__text selectable">{action.text}</p>
                    </li>
                ))}
            </ul>
        </section>
    );
}
