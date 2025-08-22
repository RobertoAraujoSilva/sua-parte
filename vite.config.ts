import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    // Evitar múltiplas cópias de React em dev
    dedupe: ['react', 'react-dom'],
  },
  server: {
    // Configuração padrão do servidor
    host: 'localhost',
    port: 8080,
    strictPort: true,
    
    // Configuração de HMR desabilitada para estabilizar desenvolvimento
    hmr: false,
    
    // Configurações de WebSocket
    watch: {
      usePolling: false,
      interval: 100,
    },
    
    // Headers de desenvolvimento
    headers: {
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
    
    // Configurações de CORS
    cors: true,
  },
  build: {
    // Otimizações de performance
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
      },
    },
    rollupOptions: {
      output: {
        // Code splitting otimizado
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-tabs', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          supabase: ['@supabase/supabase-js'],
          utils: ['lucide-react', 'clsx', 'tailwind-merge'],
        },
        // Otimização de assets
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || []
          const ext = info[info.length - 1]
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext || '')) {
            return `assets/images/[name]-[hash][extname]`
          }
          if (/woff2?|eot|ttf|otf/i.test(ext || '')) {
            return `assets/fonts/[name]-[hash][extname]`
          }
          return `assets/[name]-[hash][extname]`
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
    // Otimizações de CSS
    cssCodeSplit: true,
    // Otimizações de assets
    assetsInlineLimit: 4096,
    // Source maps apenas em desenvolvimento
    sourcemap: false,
  },
  optimizeDeps: {
    // Pré-bundle de dependências
    include: [
      'react',
      'react-dom',
      '@supabase/supabase-js',
      'lucide-react',
      '@radix-ui/react-tabs',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
    ],
    // Excluir dependências desnecessárias
    exclude: ['@supabase/mcp-server-supabase'],
  },
  // Otimizações de CSS
  css: {
    postcss: './postcss.config.js',
  },
})
