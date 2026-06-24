import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { EmpresaProvider } from './context/EmpresaContext';
import { ThemeProvider } from './context/ThemeContext'; 

import { Login } from './pages/Login';
import { Cadastro } from './pages/Cadastro';
import { Home } from './components/layouts/Home';

import { AutomacaoSQL } from './pages/TI/Automacao/AutomacaoSQL';
import { BackupsServidores } from './pages/TI/Backup/BackupsServidores';
import SuporteTecnico from './pages/TI/SuporteTecnico/SuporteTecnico'; 
import { VisaoGeral } from './pages/VisaoGeral/VisaoGeral';

export default function App() {
  return (
    <ThemeProvider>
      <EmpresaProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            
            <Route path="/home" element={<Home />}>
              <Route index element={<Navigate to="visao-geral" replace />} />
              <Route path="visao-geral" element={<VisaoGeral />} />
              <Route path="automacao-sql" element={<AutomacaoSQL />} />
              <Route path="backups" element={<BackupsServidores />} />
              <Route path="suporte-tecnico" element={<SuporteTecnico />} /> 
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </EmpresaProvider>
    </ThemeProvider>
  );
}