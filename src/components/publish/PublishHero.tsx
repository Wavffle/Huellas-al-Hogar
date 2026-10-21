import mancha from '../../assets/images/publicar/publicar-hero-mancha.svg';
import olas from '../../assets/images/publicar/publicar-hero-olas.svg';
import olasMovil from '../../assets/images/publicar/publicar-hero-olas-movil.svg';
import corazon from '../../assets/images/publicar/publicar-corazon.svg';
import mascotas from '../../assets/images/publicar/publicar-hero.webp';
import './PublishHero.css';

export default function PublishHero() {
    return (
        <section className="pub-hero" aria-labelledby="pub-hero-title">
            <div className="pub-hero__art" aria-hidden="true">
                <img src={mancha} alt="" className="pub-hero__img pub-hero__mancha" />
                <img src={mascotas} alt="" className="pub-hero__img pub-hero__pets" />
                <img src={olas} alt="" className="pub-hero__img pub-hero__olas pub-hero__olas--desktop" />
                <img src={olasMovil} alt="" className="pub-hero__img pub-hero__olas pub-hero__olas--mobile" />
                <img src={corazon} alt="" className="pub-hero__img pub-hero__heart" />
                <p className="pub-hero__quote">Ellos también merecen una segunda oportunidad</p>
            </div>

            <h1 id="pub-hero-title" className="pub-hero__title">
                <span className="pub-hero__title-left">Dale una oportunidad</span>
                <span className="pub-hero__title-right">a un nuevo hogar</span>
            </h1>

            <p className="pub-hero__text pub-hero__text--left selectable">
                Publica un animal en adopción y ayúdanos a conectarlo con una familia responsable.
            </p>
            <p className="pub-hero__text pub-hero__text--right selectable">
                Juntos podemos llegar a más personas y darle una mejor oportunidad.
            </p>
        </section>
    );
}
