import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { menuConfig } from '../../menuConfig';
import { useEmpresa } from '../../context/EmpresaContext';
import * as LucideIcons from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { MenuBar } from '../layouts/MenuBar';
import { ProfileMenuModal } from '../layouts/ProfileMenuModal';

export const Home: React.FC = () => {
  const { empresa, corTema } = useEmpresa();
  const { theme, toggleTheme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMenuBarOpen, setIsMenuBarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const [nomeUsuario, setNomeUsuario] = useState(localStorage.getItem('userName') || 'Usuário');
  const [userSetor, setUserSetor] = useState(localStorage.getItem('userSetor') || 'TI');
  
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://192.168.2.155:7000/usuarios/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        setNomeUsuario(data.nome);
        setUserSetor(data.departamento?.nome || 'TI');
      })
      .catch(err => console.error("Erro ao buscar dados do usuário:", err));
    }
  }, []);

  const itensMenuRaw = (menuConfig as any)[userSetor] || [];

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

  const handleLogout = () => {
    setIsMenuBarOpen(false);
    setIsLoggingOut(true);
    
    if (nomeUsuario) {
      localStorage.setItem(`theme_${nomeUsuario}`, theme);
    }
    
    setTimeout(() => {
      setTheme('light');
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      localStorage.removeItem('userSetor');
      navigate('/login');
    }, 1000);
  };

  const menuPerfilItens = useMemo(() => [
    { label: 'Meu Perfil', icon: 'User', action: () => setIsProfileModalOpen(true) },
    { label: 'Ajuda', icon: 'LifeBuoy', action: () => console.log('Ajuda') },

    // BOTÃO DE TEMA DESATIVADO (DESCONTINUADO MOMENTANEAMENTE)
    /*
    { 
      label: theme === 'light' ? 'Modo Escuro' : 'Modo Claro', 
      icon: theme === 'light' ? 'Moon' : 'Sun', 
      action: toggleTheme
    },
    */
    
  ], [theme, toggleTheme]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsMenuBarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`h-screen w-screen flex flex-col font-sans overflow-hidden transition-colors duration-700 animate-page-in ${theme === 'dark' ? 'bg-[#35363a]' : 'bg-[#f8f9fa]'}`}>
      
      <header 
        className="px-6 flex items-center justify-between z-20 shrink-0 shadow-[0_7px_10px_rgba(0,0,0,0.15)] transition-colors duration-700" 
        style={{ height: '85px', backgroundColor: theme === 'dark' ? '#202124' : corTema }}
      >
        <div className="flex items-center gap-4">
          <span className="text-white font-bold text-lg">Portal Tecnologia {empresa}</span>
        </div>

        <div className="flex items-center gap-6 ml-auto relative" ref={profileRef}>
          <LucideIcons.Bell className="text-white cursor-pointer hover:text-gray-300 transition-colors" size={24} />
          
          <div 
            onClick={() => setIsMenuBarOpen(!isMenuBarOpen)}
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

          <MenuBar 
            isOpen={isMenuBarOpen}
            onClose={() => setIsMenuBarOpen(false)}
            menuItems={menuPerfilItens}
            nomeUsuario={nomeUsuario}
            userSetor={userSetor}
            onLogout={handleLogout}
            theme={theme}
          />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className={`border-r h-full flex flex-col shrink-0 transition-all duration-700 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-20'} ${theme === 'dark' ? 'bg-[#2a2b2e] border-[#35363a]' : 'bg-white border-[#dee2e6]'}`}>
          
          <div className="p-6 flex items-center justify-center">
            <LucideIcons.Menu className="text-gray-400 cursor-pointer hover:text-[#E95C13] transition-colors" size={20} onClick={() => setIsSidebarOpen(!isSidebarOpen)} />
          </div>

          <nav className="flex-1 overflow-y-auto no-scrollbar pt-2 space-y-0">
            {itensMenu.map((item: any) => {
              const IconComponent = (LucideIcons as any)[item.icon] || LucideIcons.LayoutDashboard;
              const normalizedPath = String(item.path).startsWith('/') ? item.path : `/${item.path}`;
              const isActive = location.pathname.includes(normalizedPath);

              return (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  className={`flex items-center gap-4 px-6 py-3 text-sm transition-all duration-200 border-l-4 ${
                    isActive ? 'border-[#E95C13]' : 'border-transparent hover:border-[#E95C13]'
                  } ${
                    theme === 'dark' 
                      ? isActive ? 'text-[#E95C13] bg-[#404145]' : 'text-[#e8eaed] hover:bg-[#404145] hover:text-[#E95C13]'
                      : isActive ? 'text-[#E95C13] bg-orange-50' : 'text-gray-600 hover:bg-orange-50 hover:text-[#E95C13]'
                  }`}
                >
                  <IconComponent size={22} className={`shrink-0 ${isActive ? 'text-[#E95C13]' : ''}`} />
                  <span className={`font-medium whitespace-nowrap transition-all duration-700 ease-in-out ${isSidebarOpen ? 'opacity-100 max-w-[200px] translate-x-0 delay-200' : 'opacity-0 max-w-0 overflow-hidden -translate-x-4 pointer-events-none'}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className={`p-4 text-[12px] text-center font-medium text-gray-400 cursor-help transition-opacity duration-700 ease-in-out whitespace-nowrap overflow-hidden ${isSidebarOpen ? 'opacity-100 delay-300' : 'opacity-0 delay-0 pointer-events-none'}`}>
            © 2026 Tecnologia da Informação
          </div>
        </aside>

        <main className={`flex-1 p-8 overflow-y-auto transition-colors duration-700 ${theme === 'dark' ? 'bg-[#35363a]' : 'bg-[#f8f9fa]'}`} onClick={() => setIsMenuBarOpen(false)}>
          <Outlet />
        </main>
      </div>

      <ProfileMenuModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        userName={nomeUsuario} 
      />

      {isLoggingOut && (
        <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center backdrop-blur-md animate-custom-fade ${theme === 'dark' ? 'bg-[#202124]/90' : 'bg-white/90'}`}>
          <LucideIcons.Loader2 className="animate-spin text-[#E95C13] mb-4" size={42} />
          <p className={`text-base font-semibold animate-pulse tracking-wide ${theme === 'dark' ? 'text-[#e8eaed]' : 'text-gray-700'}`}>
            Encerrando sessão...
          </p>
        </div>
      )}
    </div>
  );
};