import { useEffect, useState } from 'react';

const QUERY = '(min-width: 800px)';

/** true cuando la pantalla es de escritorio (mismo corte que los @media del proyecto). */
export function useIsDesktop(): boolean {
    const [isDesktop, setIsDesktop] = useState(() => window.matchMedia(QUERY).matches);

    useEffect(() => {
        const mql = window.matchMedia(QUERY);
        const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
        mql.addEventListener('change', onChange);
        return () => mql.removeEventListener('change', onChange);
    }, []);

    return isDesktop;
}
