import nubesIzquierda from '../../assets/images/adopciones/adopciones-nubes-izquierda.webp';
import nubesDerecha from '../../assets/images/adopciones/adopciones-nubes-derecha.webp';
import nubesMovil from '../../assets/images/adopciones/adopciones-nubes-movil.svg';
import huellas from '../../assets/images/adopciones/adopciones-huellas.svg';
import './AdoptionsHero.css';

export default function AdoptionsHero() {
    return (
        <section className="adop-hero" aria-labelledby="adop-hero-title">
            <div className="adop-hero__art" aria-hidden="true">
                <img src={nubesMovil} alt="" className="adop-hero__clouds adop-hero__clouds--mobile" />
                <img src={nubesIzquierda} alt="" className="adop-hero__clouds adop-hero__clouds--left" />
                <img src={nubesDerecha} alt="" className="adop-hero__clouds adop-hero__clouds--right" />
                <img src={huellas} alt="" className="adop-hero__paws" />
            </div>

            <h1 id="adop-hero-title" className="adop-hero__title">
                <span className="adop-hero__badge">En adopción</span>
                <span className="adop-hero__line">Encuentra a tu</span>
                <em className="adop-hero__accent">próximo compañero.</em>
            </h1>

            <p className="adop-hero__text selectable">
                Conoce animales que buscan un hogar y encuentra al compañero ideal para tu vida.
            </p>
        </section>
    );
}