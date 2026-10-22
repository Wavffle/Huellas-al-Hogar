import { IonIcon } from '@ionic/react';
import { checkmarkOutline } from 'ionicons/icons';
import { adoptionQuestions, animalNeeds } from '../../data/education';
import needsImage from '../../assets/images/education/perro-gato-necesidades.webp';
import './QuestionsSection.css';

function Heart({ className }: { className: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
            <path
                d="M12 21s-7.5-4.6-9.5-9.2C1 8.3 3.2 5 6.4 5c2 0 3.6 1.1 4.6 2.7C12 6.1 13.6 5 15.6 5c3.2 0 5.4 3.3 3.9 6.8C19.5 16.4 12 21 12 21z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export default function QuestionsSection() {
    return (
        <section className="ask" aria-labelledby="ask-title">
            <h2 id="ask-title" className="ask__title">
                Antes de adoptar, pregúntate
            </h2>

            <div className="ask__layout">
                <ul className="ask__list">
                    {adoptionQuestions.map((q) => (
                        <li key={q.strong} className="ask__item">
                            <span className="ask__icon-box">
                                <img src={q.icon} alt="" className="ask__icon" />
                            </span>
                            <p className="ask__text selectable">
                                {q.before}
                                <strong>{q.strong}</strong>
                                {q.after}
                            </p>
                        </li>
                    ))}
                </ul>

                <div className="needs">
                    <svg className="needs__dash" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                        <path
                            d="M9 50 C10 32 22 18 40 22 C52 25 58 32 66 24 C70 20 72 24 72 30"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1"
                            strokeDasharray="5 5"
                            vectorEffect="non-scaling-stroke"
                        />
                    </svg>

                    <p className="needs__label">Dales lo que necesitan</p>

                    <ul className="needs__list">
                        {animalNeeds.map((need) => (
                            <li key={need} className="needs__item">
                                <IonIcon icon={checkmarkOutline} className="needs__check" aria-hidden="true" />
                                {need}
                            </li>
                        ))}
                    </ul>

                    <Heart className="needs__heart" />

                    <img
                        src={needsImage}
                        alt="Un husky sorprendido y un gato con el pulgar arriba"
                        className="needs__image"
                        loading="lazy"
                    />
                </div>
            </div>
        </section>
    );
}
