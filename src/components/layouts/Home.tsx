import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { menuConfig } from '../../menuConfig';
import { useEmpresa } from '../../context/EmpresaContext';
import * as LucideIcons from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const Home: React.FC = () => {
  const { empresa, corTema } = useEmpresa();
  const { theme, toggleTheme } = useTheme();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const profileRef = useRef<HTMLDivElement>(null);
  const nomeUsuario = localStorage.getItem('userName') || 'Usuário';
  const userSetor = localStorage.getItem('userSetor') || 'TI';
  
  // Busca os itens brutos do menu
  const itensMenuRaw = (menuConfig as any)[userSetor] || [];

  // Garante que "Visão geral" sempre seja o primeiro item da lista
  const itensMenu = useMemo(() => {
    const lista = [...itensMenuRaw];
    const indexVisaoGeral = lista.findIndex(
      (item: any) => item.label.toLowerCase() === 'visão geral'
    );
    
    if (indexVisaoGeral > 0) {
      const [visaoGeral] = lista.splice(indexVisaoGeral, 1);
      lista.unshift(visaoGeral);
    }
    return lista;
  }, [itensMenuRaw]);

  const getIniciais = (nome: string) => {
    const partes = nome.split(' ');
    if (partes.length >= 2) return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
    return nome.substring(0, 2).toUpperCase();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuPerfilItens = useMemo(() => [
    { label: 'Meu Perfil', icon: 'User', action: () => console.log('Perfil') },
    { label: 'Ajuda', icon: 'LifeBuoy', action: () => console.log('Ajuda') },
    { label: 'Configurações da Conta', icon: 'Settings', action: () => console.log('Config') },
    { 
      label: theme === 'light' ? 'Modo Escuro' : 'Modo Claro', 
      icon: theme === 'light' ? 'Moon' : 'Sun', 
      action: toggleTheme
    },
  ], [theme, toggleTheme]);

  return (
    <div className={`h-screen w-screen flex flex-col font-sans overflow-hidden transition-colors duration-700 ${theme === 'dark' ? 'bg-[#35363a]' : 'bg-[#f8f9fa]'}`}>
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        /* Suaviza a transição dos textos das subpáginas */
        .dark main h1, .dark main h2, .dark main h3, .dark main p, .dark main span, .dark main .bg-white {
          transition: color 0.7s ease-in-out, background-color 0.7s ease-in-out, border-color 0.7s ease-in-out !important;
        }
        
        /* Textos Principais */
        .dark main h1, .dark main h2, .dark main h3,
        .dark main .text-gray-900, .dark main .text-gray-800, 
        .dark main .text-slate-900, .dark main .text-slate-800 {
          color: #e8eaed !important;
        }
        
        /* Textos Secundários */
        .dark main p,
        .dark main .text-gray-600, .dark main .text-gray-500, .dark main .text-gray-400,
        .dark main .text-slate-600, .dark main .text-slate-500, .dark main .text-slate-400 {
          color: #b0b3b8 !important;
        }
        
        /* Cards */
        .dark main .bg-white {
          background-color: #404145 !important;
          border-color: #4a4b50 !important;
        }
      `}</style>

      {/* HEADER */}
      <header 
        className="px-6 flex items-center justify-between z-20 shrink-0 shadow-[0_7px_10px_rgba(0,0,0,0.15)] transition-colors duration-700" 
        style={{ height: '85px', backgroundColor: theme === 'dark' ? '#202124' : corTema }}
      >
        <div className="flex items-center gap-4">
          <span className="text-white font-bold text-lg">
            Portal Tecnologia {empresa}
          </span>
        </div>

        <div className="flex items-center gap-6 ml-auto relative" ref={profileRef}>
          <LucideIcons.Bell className="text-white cursor-pointer hover:text-gray-300 transition-colors" size={24} />
          
          <div 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={`flex items-center gap-3 px-5 py-2.5 rounded-full cursor-pointer transition-all shadow-md border min-w-[160px] justify-start ${
              theme === 'dark' 
                ? 'bg-[#404145] border-[#4a4b50] text-white hover:bg-[#4a4b50]' 
                : 'bg-white/20 border-white/30 text-white hover:bg-white/30'
            }`}
          >
            <div className={`w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-xs shrink-0 ${theme === 'dark' ? 'text-[#202124]' : 'text-gray-800'}`}>
              {getIniciais(nomeUsuario)}
            </div>
            <span className="text-white font-medium text-sm pr-2 whitespace-nowrap overflow-hidden text-ellipsis">
              {nomeUsuario}
            </span>
          </div>

          {/* DROPDOWN DE PERFIL */}
          {isProfileOpen && (
            <div className={`absolute top-20 right-0 w-64 rounded-lg shadow-xl border py-2 z-50 ${theme === 'dark' ? 'bg-[#404145] border-[#4a4b50]' : 'bg-white border-gray-100'}`}>
              <div className={`px-4 py-3 border-b ${theme === 'dark' ? 'border-[#4a4b50]' : 'border-gray-100'}`}>
                <p className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{nomeUsuario}</p>
                <p className="text-xs text-gray-400">{userSetor}</p>
              </div>
              
              <nav className="py-2">
                {menuPerfilItens.map((item) => {
                  const Icon = (LucideIcons as any)[item.icon];
                  return (
                    <button 
                      key={item.label} 
                      type="button"
                      onClick={(e) => { e.preventDefault(); item.action(); setIsProfileOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                        theme === 'dark' 
                          ? 'text-[#e8eaed] hover:bg-[#4a4b50] hover:text-[#E95C13]' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-[#E95C13]'
                      }`}
                    >
                      <Icon size={18} /> {item.label}
                    </button>
                  );
                })}
              </nav>
              
              <div className={`border-t pt-2 ${theme === 'dark' ? 'border-[#4a4b50]' : 'border-gray-100'}`}>
                <button className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 ${theme === 'dark' ? 'hover:bg-red-900/20' : 'hover:bg-red-50'}`}>
                  <LucideIcons.LogOut size={18} /> Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* BARRA LATERAL */}
        <aside className={`border-r h-full flex flex-col shrink-0 transition-all duration-700 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-20'} ${theme === 'dark' ? 'bg-[#2a2b2e] border-[#35363a]' : 'bg-white border-[#dee2e6]'}`}>
          
          <div className="p-6 flex items-center justify-center">
             <LucideIcons.Menu 
                className="text-gray-400 cursor-pointer hover:text-[#E95C13] transition-colors" 
                size={20} 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
             />
          </div>

          <nav className="flex-1 overflow-y-auto no-scrollbar pt-2 space-y-0">
            {itensMenu.map((item: any) => {
              const IconComponent = (LucideIcons as any)[item.icon] || LucideIcons.LayoutDashboard;
              
              return (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  className={`flex items-center gap-4 px-6 py-3 text-sm transition-all duration-700 border-l-4 border-transparent hover:border-[#E95C13] ${
                    theme === 'dark' 
                      ? 'text-[#e8eaed] hover:bg-[#404145] hover:text-[#E95C13]' 
                      : 'text-gray-600 hover:bg-orange-50 hover:text-[#E95C13]'
                  }`}
                >
                  <IconComponent size={22} className="shrink-0 transition-transform duration-700" />
                  
                  <span className={`font-medium whitespace-nowrap transition-all duration-700 ease-in-out ${
                    isSidebarOpen 
                      ? 'opacity-100 max-w-[200px] translate-x-0 delay-200' 
                      : 'opacity-0 max-w-0 overflow-hidden -translate-x-4 pointer-events-none'
                  }`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* AJUSTADO: Rodapé agora usa puramente transition-opacity e whitespace-nowrap */}
          <div 
            title="Desenvolvido por Gabriel Malheiro e Henrique Arroyo."
            className={`p-4 text-[12px] text-center font-medium text-gray-400 cursor-help transition-opacity duration-700 ease-in-out whitespace-nowrap overflow-hidden ${
              isSidebarOpen 
                ? 'opacity-100 delay-300' 
                : 'opacity-0 delay-0 pointer-events-none'
            }`}
          >
            © 2026 Tecnologia da Informação
          </div>
        </aside>

        {/* CONTAINER DO CONTEÚDO PRINCIPAL */}
        <main className={`flex-1 p-8 overflow-y-auto transition-colors duration-700 ${theme === 'dark' ? 'bg-[#35363a]' : 'bg-[#f8f9fa]'}`} onClick={() => setIsProfileOpen(false)}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};