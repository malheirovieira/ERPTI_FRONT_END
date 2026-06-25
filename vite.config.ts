import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  define: {
    global: 'window',
  },
  // --- ADICIONE ESTA PARTE ABAIXO ---
  server: {
    host: '0.0.0.0', // Permite que o servidor aceite conexões de outros IPs da rede
    port: 5173,      // Porta padrão (ou a que você preferir)
  },
  // ----------------------------------
})