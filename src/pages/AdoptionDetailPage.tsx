import { IonButton } from '@ionic/react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
export default function AdoptionDetailPage() { const { animalId } = useParams<{ animalId: string }>(); const { user } = useAuth(); return <main className="page-shell"><p className="eyebrow">Adopciones / Detalle</p><h1>{animalId === 'luna' ? 'Luna' : 'Max'}</h1><p>Animal rescatado que busca una familia responsable y comprometida.</p><IonButton routerLink={user ? '/perfil' : '/login'}>Quiero adoptar</IonButton></main>; }