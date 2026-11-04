import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: { port: 5181, strictPort: true },
  preview: { port: 5182, strictPort: true },
  esbuild: { drop: ['console', 'debugger'] },
  build: {
    sourcemap: false,
    rollupOptions: {
      input: { main: 'index.html', redirect: 'redirect.html' },
    },
  },
})
