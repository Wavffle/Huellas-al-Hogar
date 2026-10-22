import { howItWorksSteps } from '../../data/howItWorks';
import './HowItWorksSection.css';

export default function HowItWorksSection() {
    return (
        <section className="how" aria-labelledby="how-title">
            <p className="how__eyebrow">¿Cómo funciona?</p>
            <h2 id="how-title" className="how__title">
                Adopta y dales un <span>gran hogar</span>
            </h2>

            <ol className="how__steps">
                {howItWorksSteps.map((step) => (
                    <li key={step.number} className="how-step">
                        <span className="how-step__number">{step.number}</span>
                        <img src={step.image} alt={step.alt} className="how-step__image" />
                        <div className="how-step__card">
                            <h3 className="how-step__title">{step.title}</h3>
                            <p className="how-step__text">{step.text}</p>
                        </div>
                    </li>
                ))}
            </ol>
        </section>
    );
}