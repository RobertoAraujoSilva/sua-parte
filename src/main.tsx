import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/responsive.css'
import './styles/page-shell.css'
import './i18n' // Initialize i18n
import { ErrorBoundary } from "react-error-boundary";
import FallbackScreen from "@/components/FallbackScreen";
import SafeAreaLayout from "@/layouts/SafeAreaLayout";
import { DensityProvider } from "@/contexts/DensityContext";
import './sw-register';
import { setupGlobalAuthErrorHandler } from './utils/authErrorHandler'

// Setup global auth error handler
setupGlobalAuthErrorHandler()

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary FallbackComponent={FallbackScreen}>
    <DensityProvider>
      <SafeAreaLayout>
        <App />
      </SafeAreaLayout>
    </DensityProvider>
  </ErrorBoundary>
);
