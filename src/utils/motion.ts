const KEY = 'huellas-motion-off';

export function isMotionOff(): boolean {
    try {
        return localStorage.getItem(KEY) === '1';
    } catch {
        return false;
    }
}

/** Aplica la preferencia: atributo en <html> (para el CSS). */
export function applyMotion(off: boolean) {
    document.documentElement.dataset.motion = off ? 'off' : 'on';
}

export function setMotionOff(off: boolean) {
    applyMotion(off);
    try {
        localStorage.setItem(KEY, off ? '1' : '0');
    } catch {
        /* sin almacenamiento: la preferencia dura solo esta sesión */
    }
    window.dispatchEvent(new Event('motionchange'));
}