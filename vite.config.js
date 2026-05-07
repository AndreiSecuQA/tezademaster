import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Use relative paths so the build works regardless of subpath (GitHub Pages, custom domain, etc.).
export default defineConfig({
  base: './',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['pdfjs-dist'],
  },
  build: {
    target: 'es2020',
    sourcemap: false,
  },
})
