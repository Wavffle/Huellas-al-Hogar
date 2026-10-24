import { Link } from 'react-router-dom';
import './NotFoundPage.css';

export default function NotFoundPage() {
    return (
        <div className="nf-page">
            <p className="nf-code">404</p>
            <h1 className="nf-title">No encontramos esta página</h1>
            <p className="nf-text selectable">La dirección no existe o fue movida.</p>
            <Link to="/inicio" className="nf-button">
                Volver al inicio
            </Link>
        </div>
    );
}