import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { EmpresaProvider } from './context/EmpresaContext';
import { ThemeProvider } from './context/ThemeContext'; // Importe o Provider
import { AutomacaoSQL } from './pages/TI/AutomacaoSQL';
import { BackupsServidores } from './pages/TI/BackupsServidores';
import { Login } from './pages/Login';
import { VisaoGeral } from './pages/TI/VisaoGeral';
import { Cadastro } from './pages/Cadastro';
import { Home } from './components/layouts/Home';

const SuporteTecnico = () => <div className="p-8">Módulo de Suporte Técnico</div>;

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