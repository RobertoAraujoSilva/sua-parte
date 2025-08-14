import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/responsive.css'
import './styles/page-shell.css'
import { ErrorBoundary } from "react-error-boundary";
import FallbackScreen from "@/components/FallbackScreen";
import SafeAreaLayout from "@/layouts/SafeAreaLayout";
import { DensityProvider } from "@/contexts/DensityContext";
import './sw-register';

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary FallbackComponent={FallbackScreen}>
    <DensityProvider>
      <SafeAreaLayout>
        <App />
      </SafeAreaLayout>
    </DensityProvider>
  </ErrorBoundary>
);
