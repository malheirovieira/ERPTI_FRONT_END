import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { ThemeProvider } from './context/ThemeContext'; // Importação correta

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider> {/* ENVOLVENDO TODA A APLICAÇÃO */}
      <App />
    </ThemeProvider>
  </StrictMode>
);