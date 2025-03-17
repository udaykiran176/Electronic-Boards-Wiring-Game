import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 3000,
    strictPort: true,
    middlewareMode: false
  },
  preview: {
    port: 3000,
    strictPort: true
  }
})
