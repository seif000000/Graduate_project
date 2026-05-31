import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Increase warning limit (optional) – set higher if still large
    chunkSizeWarningLimit: 1000, // in KB
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate admin UI components
          admin: ['src/components/layouts/LayoutAdmin.jsx'],
          // Separate pharmacy UI components
          pharmacy: ['src/components/layouts/LayoutPharmacy.jsx'],
          // Vendor libraries – will be split into its own chunk
          vendor: ['react', 'react-dom', 'react-router-dom']
        }
      }
    }
  }
})
