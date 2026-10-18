import { stats, statsSource } from '../data/consequences';
import puppyImage from '../../assets/images/consequences/cachorro-abandono.webp';
import './ConsequencesIntro.css';

export default function ConsequencesIntro() {
    return (
        <section className="aban-intro" aria-labelledby="aban-intro-title">
            <div className="aban-intro__grid">
                <div className="aban-intro__panel">
                    <h2 id="aban-intro-title" className="aban-intro__eyebrow">
                        Consecuencias del abandono
                    </h2>
                    <p className="aban-intro__text selectable">
                        El abandono tiene un impacto profundo en la vida de los animales y también en
                        nuestras comunidades. Conocer sus consecuencias nos ayuda a tomar decisiones más
                        informadas y ser parte del cambio.
                    </p>
                </div>

                <div className="aban-intro__photo">
                    <img src={puppyImage} alt="Un cachorro negro y café acostado entre el pasto" />
                </div>
            </div>

            <ul className="aban-intro__stats">
                {stats.map((stat) => (
                    <li key={stat.value} className="aban-stat">
                        <img src={stat.icon} alt="" className="aban-stat__icon" />
                        <div className="aban-stat__copy">
                            <p className="aban-stat__value">{stat.value}</p>
                            <p className="aban-stat__text selectable">{stat.text}</p>
                        </div>
                    </li>
                ))}
            </ul>

            <p className="aban-intro__source selectable">{statsSource}</p>
        </section>
    );
}
