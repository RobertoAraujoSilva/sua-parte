import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    hmr: {
      port: 8080,
      host: 'localhost',
      clientPort: 8080,
      protocol: 'ws',
      timeout: 30000
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ['jspdf']
  },
  build: {
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          jspdf: ['jspdf']
        }
      }
    }
  },
})
