import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
// Self-hosted fonts (bundled + precached for offline; no external CDN, no IP leak).
import '@fontsource-variable/cinzel';
import '@fontsource/spline-sans/400.css';
import '@fontsource/spline-sans/500.css';
import '@fontsource/spline-sans/600.css';
import '@fontsource/spline-sans/700.css';
import App from './App';
import './styles/index.css';

// Auto-update the service worker when a new build is deployed.
registerSW({ immediate: true });

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element #root not found');

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>
);
