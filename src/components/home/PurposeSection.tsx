import { purposeSteps } from '../data/purposeSteps';
import purposeImage from '../../assets/images/purpose/perro-gato.webp';
import clouds from '../../assets/images/purpose/nubes-fondo.webp';
import './PurposeSection.css';

export default function PurposeSection() {
    return (
        <section
            className="purpose"
            aria-labelledby="purpose-title"
            style={{ backgroundImage: `url(${clouds})` }}
        >
            <div className="purpose__inner">
                <div className="purpose__content">
                    <p className="purpose__eyebrow">Nuestro propósito</p>
                    <h2 id="purpose-title" className="purpose__title">
                        Más que encontrar un <span>nuevo hogar</span>
                    </h2>

                    <ol className="purpose__steps">
                        {purposeSteps.map((step) => (
                            <li key={step.number} className="purpose-step">
                                <div className="purpose-step__head">
                                    <span className="purpose-step__number">{step.number}</span>
                                    <h3 className="purpose-step__title">{step.title}</h3>
                                </div>
                                <p className="purpose-step__text">{step.text}</p>
                            </li>
                        ))}
                    </ol>
                </div>

                <figure className="purpose__figure">
                    <img
                        src={purposeImage}
                        alt="Un gato y un cachorro de perro juntos"
                        className="purpose__image"
                    />
                </figure>
            </div>
        </section>
    );
}