import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./index.css";

// Actively unregister any previously installed service worker and clear its
// caches. The SW was causing white-screen issues inside the Lovable preview
// iframe; this guarantees existing users get cleaned up on next load.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    regs.forEach((reg) => reg.unregister());
  });
  if ('caches' in window) {
    caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
  }
}

// One-time cleanup of legacy preview-zoom localStorage keys so any leftover
// 0.72 values can't be re-read by stale code paths.
try {
  localStorage.removeItem('selfera-preview-zoom-mobile');
  localStorage.removeItem('selfera-preview-zoom-tablet');
  localStorage.removeItem('selfera-preview-zoom-desktop');
} catch {}

// Surface otherwise-silent failures to the console so white-screens become
// debuggable instead of mysterious.
window.addEventListener('error', (e) => {
  console.error('[GlobalError]', e.error || e.message, e);
});
window.addEventListener('unhandledrejection', (e) => {
  console.error('[UnhandledRejection]', e.reason);
});

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </ErrorBoundary>
);
