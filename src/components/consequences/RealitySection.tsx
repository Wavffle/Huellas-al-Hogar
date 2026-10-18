import './RealitySection.css';

export default function RealitySection() {
    return (
        <section className="aban-reality" aria-labelledby="aban-reality-question">
            <div className="aban-reality__inner">
                <p className="aban-reality__lead selectable">
                    <strong>Es una realidad que nos afecta a todos.</strong> El abandono no solo cambia
                    la vida de un animal, también impacta en nuestras ciudades, en la convivencia y en
                    los recursos destinados a su cuidado.
                </p>

                <h2 id="aban-reality-question" className="aban-reality__question">
                    ¿Qué podemos hacer?
                </h2>
            </div>
        </section>
    );
}
