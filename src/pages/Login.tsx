import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Headset, Eye, EyeOff } from 'lucide-react';
import { useTheme } from "../context/ThemeContext";
// Importação da URL configurada centralizadamente
import { API_URL } from '../services/api'; 

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);
  
    try {
      // Alterado para utilizar a constante global API_URL
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim(), senha }),
      });

      if (!response.ok) {
        throw new Error('E-mail ou senha inválidos.');
      }

      const data = await response.json();
      
      // Armazena o token JWT para autenticação Bearer nas próximas requisições
      localStorage.setItem('token', data.token);
      localStorage.setItem('userEmail', email.trim());

      setTheme('light'); 
      setCarregando(false);
      navigate('/home', { replace: true });
      
    } catch (err: any) {
      setErro(err.message || 'Erro ao conectar com o servidor.');
      setCarregando(false);
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#f8f9fa] font-sans p-4">
      <div className="w-full max-w-md bg-white border border-[#dee2e6] rounded-md shadow-lg p-12 flex flex-col gap-8">
        <div className="text-center flex flex-col items-center gap-3">
          <div className="w-16 h-16 bg-[#E95C13] rounded-full flex items-center justify-center text-white shadow-md">
            <Headset size={32} />
          </div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight mt-1">Portal Tecnologia</h1>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          {erro && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-sm">⚠️ {erro}</div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@email.com.br"
              className="w-full px-4 py-3 bg-gray-50 border border-[#dee2e6] rounded-sm text-sm outline-none focus:border-[#E95C13] focus:ring-1 focus:ring-[#E95C13] transition-all text-gray-800"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Senha</label>
            <div className="relative w-full">
              <input
                type={mostrarSenha ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-gray-50 border border-[#dee2e6] rounded-sm text-sm outline-none focus:border-[#E95C13] focus:ring-1 focus:ring-[#E95C13] transition-all pr-12 text-gray-800"
                required
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#E95C13] transition-colors"
              >
                {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-[#E95C13] text-white font-bold text-sm py-4 rounded-sm hover:bg-[#d4500f] transition-all disabled:opacity-50 mt-2"
          >
            {carregando ? 'Autenticando...' : 'Entrar no Portal'}
          </button>
        </form>

        <div className="text-center text-xs text-gray-500">
          Não possui cadastro?{' '}
          <button
            type="button"
            onClick={() => navigate('/cadastro')}
            className="text-[#E95C13] hover:underline font-bold transition-all"
          >
            Clique aqui e cadastre-se
          </button>
        </div>
      </div>

      <div className="mt-8 text-center text-gray-400 text-[10px] uppercase tracking-widest font-semibold">
        © 2026 Tecnologia da Informação
      </div>
    </div>
  );
};