import { defineConfig, loadEnv, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { componentTagger } from "lovable-tagger"

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendUrl = (env.VITE_API_BASE_URL || '').replace(/\/$/, '')
  const forceMock = env.VITE_FORCE_MOCK === '1' || env.VITE_FORCE_MOCK === 'true'
  const isSelfProxy = /localhost:8080|127\.0\.0\.1:8080/.test(backendUrl)
  const hasProxy = Boolean(backendUrl) && !isSelfProxy && !forceMock
  
  if (isSelfProxy) {
    console.warn('[dev] VITE_API_BASE_URL aponta para localhost:8080; proxy desabilitado e mocks de API ativados.');
  }
  const devMockPlugin: Plugin | null = hasProxy ? null : {
    name: 'dev-mock-api',
    apply: 'serve',
    configureServer(server) {
      // Mock leve para desenvolvimento quando não há backend configurado
      server.middlewares.use((req, res, next) => {
        const url = req.url || '';
        if (!url.startsWith('/api')) return next();

        res.setHeader('Content-Type', 'application/json');

        if (url.startsWith('/api/admin/scan-pdfs')) {
          return res.end(JSON.stringify({ success: true, pdfs: [], total: 0 }));
        }
        if (url.startsWith('/api/admin/programmings')) {
          return res.end(JSON.stringify({ success: true, total: 0, programmings: [] }));
        }
        if (url.startsWith('/api/admin/parse-pdf') || url.startsWith('/api/admin/validate-pdf') || url.startsWith('/api/admin/save-programming')) {
          return res.end(JSON.stringify({ success: false, error: 'Backend não configurado (VITE_API_BASE_URL ausente)' }));
        }
        // Catch-all para outras rotas /api durante dev sem backend
        return res.end(JSON.stringify({ success: false, error: 'Rota /api não mockada e backend ausente. Defina VITE_API_BASE_URL.' }));
      });
    },
  };

  return {
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    ...(devMockPlugin ? [devMockPlugin] : [])
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    // Evitar múltiplas cópias de React em dev
    dedupe: ['react', 'react-dom'],
  },
  server: {
    // Configuração padrão do servidor
    host: "::",
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
    // Proxy para backend durante desenvolvimento, quando VITE_API_BASE_URL estiver definido
    proxy: hasProxy ? {
      '/api': {
        target: backendUrl,
        changeOrigin: true,
        secure: false,
        // Não reescreve o caminho; mantém /api/*
      },
    } : undefined,
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
}
})
