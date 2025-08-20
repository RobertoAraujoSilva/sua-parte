import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({
    // Enable React Fast Refresh
    fastRefresh: true,
    // Optimize JSX runtime
    jsxRuntime: 'automatic'
  })],
  server: {
    port: 8080,
    host: true,
    // Enable HTTP/2 for better performance
    https: false,
    // Optimize HMR
    hmr: {
      port: 8080,
      overlay: false
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@supabase/supabase-js',
      'lucide-react',
      'jspdf'
    ],
    exclude: [
      'ag-grid-community',
      'ag-grid-react'
    ]
  },
  build: {
    // Optimize build performance
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Data fetching
          'query-vendor': ['@tanstack/react-query'],
          // Supabase
          'supabase-vendor': ['@supabase/supabase-js'],
          // UI libraries
          'ui-vendor': ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-select'],
          // Heavy components (lazy loaded)
          'ag-grid': ['ag-grid-community', 'ag-grid-react'],
          // PDF utilities
          'pdf-vendor': ['jspdf', 'pdf-parse'],
          // Utilities
          'utils-vendor': ['date-fns', 'clsx', 'class-variance-authority']
        },
        // Optimize chunk size
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `js/${facadeModuleId}-[hash].js`;
        }
      }
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000
  },
  // Enable source maps only in development
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
  }
})
