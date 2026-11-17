import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // El único chunk que supera los 500 kB es la librería Ionic (≈245 kB comprimidos),
    // que es de terceros y no se puede dividir más; por eso se sube el límite del aviso.
    chunkSizeWarningLimit: 1300,
    rollupOptions: {
      output: {
        // Separa las librerías grandes en archivos propios para que se descarguen en paralelo y queden en caché
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('@ionic') || id.includes('ionicons') || id.includes('@stencil')) return 'ionic';
          if (/node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)\//.test(id)) return 'react';
          return undefined;
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
});