import { IonIcon } from '@ionic/react';
import { chevronDown } from 'ionicons/icons';
import { faqs } from '../data/faqs';
import './FaqSection.css';

export default function FaqSection() {
    return (
        <section className="faq" aria-labelledby="faq-title">
            <div className="faq__inner">
                <p className="faq__eyebrow">¿Tienes alguna duda?</p>
                <h2 id="faq-title" className="faq__title">
                    Preguntas Frecuentes
                </h2>

                <div className="faq__list">
                    {faqs.map((faq) => (
                        <details key={faq.question} className="faq-item">
                            <summary className="faq-item__summary">
                                <span className="faq-item__question">{faq.question}</span>
                                <span className={`faq-item__tag faq-item__tag--${faq.tagColor}`}>{faq.tag}</span>
                                <IonIcon icon={chevronDown} className="faq-item__chevron" aria-hidden="true" />
                            </summary>
                            <p className="faq-item__answer">{faq.answer}</p>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    );
}