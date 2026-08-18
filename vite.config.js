import { defineConfig } from 'vite';

// Base '' => rutas relativas, para que funcione en Render Static Site.
export default defineConfig({
  base: '',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
  },
});
