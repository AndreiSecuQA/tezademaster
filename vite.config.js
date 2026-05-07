import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// For GitHub Pages: when deployed under https://<user>.github.io/<repo>/
// set base to '/<repo>/'. Override at build time with VITE_BASE.
const base = process.env.VITE_BASE || '/'

export default defineConfig({
  base,
  plugins: [react()],
  optimizeDeps: {
    exclude: ['pdfjs-dist'],
  },
  build: {
    target: 'es2020',
    sourcemap: false,
  },
})
