import { IonIcon } from '@ionic/react';
import { pauseCircleOutline, playCircleOutline } from 'ionicons/icons';
import { setMotionOff } from '../../utils/motion';
import { useMotionOff } from '../../utils/useMotionOff';
import './MotionToggle.css';

export default function MotionToggle() {
    const off = useMotionOff();
    const label = off ? 'Activar animaciones' : 'Desactivar animaciones';

    return (
        <button
            type="button"
            className="motion-toggle"
            aria-label={label}
            title={label}
            onClick={() => setMotionOff(!off)}
        >
            <IonIcon icon={off ? playCircleOutline : pauseCircleOutline} aria-hidden="true" />
        </button>
    );
}