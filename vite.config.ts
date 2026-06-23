import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Ativa o motor do Tailwind v4 no build do Vite
  ],
  define: {
    // Mapeia o objeto 'global' para o 'window' do navegador
    global: 'window',
  },
})