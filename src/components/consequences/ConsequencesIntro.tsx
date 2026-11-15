import ContentState from '../common/ContentState';
import { imagenContenido } from '../../utils/contenido';
import { useBloques } from '../../utils/useBloques';
import puppyImage from '../../assets/images/consequences/cachorro-abandono.webp';
import './ConsequencesIntro.css';

export default function ConsequencesIntro() {
    const estadisticas = useBloques('ESTADISTICAS');
    const fuente = useBloques('FUENTE');

    const loading = estadisticas.loading || fuente.loading;
    const error = estadisticas.error || fuente.error;
    const reload = () => {
        estadisticas.reload();
        fuente.reload();
    };

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

            <ContentState loading={loading} error={error} onRetry={reload} label="Cargando datos…">
                <ul className="aban-intro__stats">
                    {estadisticas.items.map((stat) => (
                        <li key={stat.id} className="aban-stat">
                            <img src={imagenContenido(stat.imagen)} alt="" className="aban-stat__icon" />
                            <div className="aban-stat__copy">
                                <p className="aban-stat__value">{stat.titulo}</p>
                                <p className="aban-stat__text selectable">{stat.texto}</p>
                            </div>
                        </li>
                    ))}
                </ul>

                {fuente.items[0] && <p className="aban-intro__source selectable">{fuente.items[0].texto}</p>}
            </ContentState>
        </section>
    );
}
