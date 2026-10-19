import { useParams } from 'react-router-dom';

export default function AdoptionRequestPage() {
    const { animalId } = useParams<{ animalId: string }>();
    return (
        <main className="page-shell">
            <h1>Solicitud de adopción</h1>
            <p>Formulario pendiente para el animal {animalId}.</p>
        </main>
    );
}