import { useState } from 'react';
import { IonIcon } from '@ionic/react';
import { chevronDown } from 'ionicons/icons';
import { faqs } from '../data/faqs';
import './FaqSection.css';

export default function FaqSection() {
    const [openItems, setOpenItems] = useState<number[]>([]);

    const toggle = (index: number) =>
        setOpenItems((items) =>
            items.includes(index) ? items.filter((i) => i !== index) : [...items, index],
        );

    return (
        <section className="faq" aria-labelledby="faq-title">
            <div className="faq__inner">
                <p className="faq__eyebrow">¿Tienes alguna duda?</p>
                <h2 id="faq-title" className="faq__title">
                    Preguntas Frecuentes
                </h2>

                <div className="faq__list">
                    {faqs.map((faq, index) => {
                        const isOpen = openItems.includes(index);

                        return (
                            <div key={faq.question} className={`faq-item${isOpen ? ' is-open' : ''}`}>
                                <h3 className="faq-item__heading">
                                    <button
                                        type="button"
                                        id={`faq-button-${index}`}
                                        className="faq-item__summary"
                                        aria-expanded={isOpen}
                                        aria-controls={`faq-panel-${index}`}
                                        onClick={() => toggle(index)}
                                    >
                                        <span className="faq-item__question">{faq.question}</span>
                                        <span className={`faq-item__tag faq-item__tag--${faq.tagColor}`}>
                                            {faq.tag}
                                        </span>
                                        <IonIcon
                                            icon={chevronDown}
                                            className="faq-item__chevron"
                                            aria-hidden="true"
                                        />
                                    </button>
                                </h3>

                                <div
                                    id={`faq-panel-${index}`}
                                    className="faq-item__panel"
                                    role="region"
                                    aria-labelledby={`faq-button-${index}`}
                                >
                                    <div className="faq-item__panel-inner">
                                        <p className="faq-item__answer">{faq.answer}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}