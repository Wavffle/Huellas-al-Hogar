/// <reference types="vite/client" />

interface ImportMetaEnv {
    /** Origen del backend, sin /api. Si no se define se usa http://localhost:3000. */
    readonly VITE_API_URL?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}