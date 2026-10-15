import logoClaro from '../../assets/images/logo/logo-claro.svg';
import illustration from '../../assets/images/footer/mujer-perros-gatos.webp';
import './Footer.css';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer__inner">
                <div className="footer__brand">
                    <img src={logoClaro} alt="Huellas al Hogar" className="footer__logo" />
                    <p className="footer__text">
                        Conectamos animales que buscan un hogar con personas dispuestas a brindarle una vida mejor.
                    </p>
                </div>
                <img src={illustration} alt="" className="footer__illustration" />
            </div>
        </footer>
    );
}