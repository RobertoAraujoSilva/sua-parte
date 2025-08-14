import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ErrorBoundary } from "react-error-boundary";
import FallbackScreen from "@/components/FallbackScreen";
import SafeAreaLayout from "@/layouts/SafeAreaLayout";
import './sw-register';

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary FallbackComponent={FallbackScreen}>
    <SafeAreaLayout>
      <App />
    </SafeAreaLayout>
  </ErrorBoundary>
);
