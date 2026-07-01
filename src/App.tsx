import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { EmpresaProvider } from './context/EmpresaContext';
import { ThemeProvider } from './context/ThemeContext'; 
import { BatePapoProvider } from './pages/Bate-Papo/context/BatePapoContext';

import { Login } from './pages/Login';
import { Cadastro } from './pages/Cadastro';
import { Home } from './components/layouts/Home';

import SuporteTecnico from './pages/TI/SuporteTecnico/SuporteTecnico'; 
import { VisaoGeral } from './pages/VisaoGeral/VisaoGeral';
import { BatePapoPagina } from './pages/Bate-Papo/BatePapoPagina'

export default function App() {
  return (
    <ThemeProvider>
      <EmpresaProvider>
        <BatePapoProvider> {/* 3. Envolva a aplicação (ou as rotas privadas) */}
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Cadastro />} />
              
              <Route path="/home" element={<Home />}>
                <Route index element={<Navigate to="visao-geral" replace />} />
                <Route path="visao-geral" element={<VisaoGeral />} />
                <Route path="suporte-tecnico" element={<SuporteTecnico />} />
                <Route path="batepapo" element={<BatePapoPagina />} /> 
              </Route>

              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </BatePapoProvider>
      </EmpresaProvider>
    </ThemeProvider>
  );
}