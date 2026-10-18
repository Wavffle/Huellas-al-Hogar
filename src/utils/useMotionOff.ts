import { useEffect, useState } from 'react';
import { isMotionOff } from './motion';

export function useMotionOff(): boolean {
    const [off, setOff] = useState(isMotionOff);

    useEffect(() => {
        const sync = () => setOff(isMotionOff());
        window.addEventListener('motionchange', sync);
        return () => window.removeEventListener('motionchange', sync);
    }, []);

    return off;
}