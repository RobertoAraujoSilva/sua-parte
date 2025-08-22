import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/responsive.css'
import './styles/page-shell.css'
import './i18n' // Initialize i18n
import { ErrorBoundary } from '@/components/ErrorBoundary';
import SafeAreaLayout from "@/layouts/SafeAreaLayout";
import { DensityProvider } from "@/contexts/DensityContext";
import { monitorWebVitals, analyzeBundle } from './config/performance';
// Register Service Worker only in production to avoid HMR conflicts in dev
if (import.meta.env.PROD) {
  import('./sw-register');
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <DensityProvider>
      <SafeAreaLayout>
        <App />
      </SafeAreaLayout>
    </DensityProvider>
  </ErrorBoundary>
);

// 🚀 Development: ensure no Service Worker interferes with Vite HMR
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations()
    .then((regs) => regs.forEach((r) => r.unregister()))
    .catch(() => {});
  if ('caches' in window) {
    caches.keys()
      .then((keys) => keys.forEach((key) => caches.delete(key)))
      .catch(() => {});
  }
}

// 🚀 Performance Monitoring
if (import.meta.env.DEV) {
  monitorWebVitals();
  
  // 📊 Bundle Analysis após carregamento
  window.addEventListener('load', () => {
    setTimeout(analyzeBundle, 1000);
  });
}
