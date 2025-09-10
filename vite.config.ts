import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  server: {
    host: "127.0.0.1",
    port: 5173,
    hmr: {
      port: 5173,
      host: '127.0.0.1',
      clientPort: 5173,
      protocol: 'ws',
      timeout: 30000
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
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
}))

