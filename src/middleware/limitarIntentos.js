// Limita peticiones por IP en una ventana de tiempo
export function limitarIntentos({ max = 10, ventanaMs = 15 * 60 * 1000 } = {}) {
    const registro = new Map();

    // Limpieza periódica; unref() evita que este temporizador mantenga vivo el proceso
    setInterval(() => {
        const ahora = Date.now();
        for (const [ip, dato] of registro) if (dato.reinicio <= ahora) registro.delete(ip);
    }, ventanaMs).unref();

    return (req, res, next) => {
        const ahora = Date.now();
        const dato = registro.get(req.ip);

        if (!dato || dato.reinicio <= ahora) {
            registro.set(req.ip, { cuenta: 1, reinicio: ahora + ventanaMs });
            return next();
        }

        dato.cuenta += 1;
        if (dato.cuenta > max) {
            res.set("Retry-After", String(Math.ceil((dato.reinicio - ahora) / 1000)));
            return res.status(429).json({
                success: false,
                error: { message: "Demasiados intentos. Espera unos minutos e inténtalo de nuevo." },
            });
        }
        return next();
    };
}