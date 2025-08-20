import { createRoot } from 'react-dom/client'
import { Suspense } from 'react'
import './index.css'
import './styles/responsive.css'
import './styles/page-shell.css'
import { ErrorBoundary } from "react-error-boundary";
import { Skeleton } from "@/components/ui/skeleton";
import App from './App'
import SafeAreaLayout from "@/layouts/SafeAreaLayout";
import { DensityProvider } from "@/contexts/DensityContext";

// Initialize i18n synchronously to ensure it's ready
import './i18n';

// Register service worker asynchronously
if ('serviceWorker' in navigator) {
  import('./sw-register');
}

// Minimal loading screen
const InitialLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="space-y-4 w-full max-w-md px-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-8 w-3/4" />
    </div>
  </div>
);

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary FallbackComponent={() => <InitialLoader />}>
    <Suspense fallback={<InitialLoader />}>
      <DensityProvider>
        <SafeAreaLayout>
          <App />
        </SafeAreaLayout>
      </DensityProvider>
    </Suspense>
  </ErrorBoundary>
);
