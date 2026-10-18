import { useEffect, useState } from 'react';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonSpinner } from '@ionic/react';
import { getAnimales } from '../services/animalService';

export default function AdoptionsPage() {
    const [animals, setAnimals] = useState<any[]>([]);
    const [cargando, setCargando] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getAnimales()
            .then((data) => {
                setAnimals(data);
                setCargando(false);
            })
            .catch((err) => {
                console.error("Error al cargar animales:", err);
                setError("No se pudo obtener la lista de animales.");
                setCargando(false);
            });
    }, []);

    return (
        <main className="page-shell">
            <p className="eyebrow">Catálogo</p>
            <h1>Animales en adopción</h1>

            {cargando && (
                <div style={{ textAlign: 'center', margin: '2rem 0' }}>
                    <IonSpinner name="crescent" />
                    <p>Cargando animales desde el servidor...</p>
                </div>
            )}

            {error && (
                <p style={{ color: 'var(--ion-color-danger, #e53e3e)', textAlign: 'center' }}>
                    {error}
                </p>
            )}

            {!cargando && !error && animals.length === 0 && (
                <p style={{ textAlign: 'center' }}>No hay animales registrados por el momento.</p>
            )}

            {!cargando && !error && animals.length > 0 && (
                <div className="animal-grid">
                    {animals.map((animal) => (
                        <IonCard key={animal.id}>
                            <IonCardHeader>
                                <IonCardTitle>{animal.nombre}</IonCardTitle>
                            </IonCardHeader>
                            <IonCardContent>
                                <p>
                                    {animal.especie} · {animal.edad ? `${animal.edad} años` : 'Edad no especificada'}
                                </p>
                                <p>Estado: {animal.estado}</p>
                                <IonButton fill="outline" routerLink={`/adopciones/${animal.id}`}>
                                    Ver detalle
                                </IonButton>
                            </IonCardContent>
                        </IonCard>
                    ))}
                </div>
            )}
        </main>
    );
}
