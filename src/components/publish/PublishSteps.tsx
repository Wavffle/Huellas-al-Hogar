import { IonIcon } from '@ionic/react';
import { checkmark } from 'ionicons/icons';
import { PUBLISH_STEPS } from '../../data/publish';
import art from '../../assets/images/publicar/publicar-perro-gato-lineas.svg';
import './PublishSteps.css';

interface Props {
    current: number;
    /** Solo se puede volver a pasos ya completados. */
    onSelect: (step: number) => void;
}

/** Desktop: menú lateral lila. Móvil: indicador horizontal de pasos. */
export default function PublishSteps({ current, onSelect }: Props) {
    return (
        <aside className="pub-steps" aria-label="Pasos para publicar un animal">
            <ol className="pub-steps__list">
                {PUBLISH_STEPS.map((step, i) => {
                    const n = i + 1;
                    const state = n < current ? 'done' : n === current ? 'active' : 'todo';
                    return (
                        <li key={step.id} className={`pub-steps__item is-${state}`}>
                            <button
                                type="button"
                                className="pub-steps__btn"
                                disabled={state !== 'done'}
                                aria-current={state === 'active' ? 'step' : undefined}
                                onClick={() => onSelect(n)}
                            >
                                <span className="pub-steps__dot">
                                    {state === 'done' ? <IonIcon icon={checkmark} aria-hidden="true" /> : n}
                                </span>
                                <span className="pub-steps__label">
                                    <span className="pub-steps__text">{step.label}</span>
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ol>
            <img src={art} alt="" className="pub-steps__art" />
        </aside>
    );
}
