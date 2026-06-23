import React from 'react';
import * as LucideIcons from 'lucide-react';

interface MenuBarProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: any[];
  nomeUsuario: string;
  userSetor: string;
  onLogout: () => void;
  theme: string;
}

export const MenuBar: React.FC<MenuBarProps> = ({ 
  isOpen, onClose, menuItems, nomeUsuario, userSetor, onLogout, theme 
}) => {
  if (!isOpen) return null;

  return (
    /* Ajustado de top-20 (80px) para top-[85px] caso precise alinhar com a altura do header,
      ou mantido o padrão nativo top-20 para evitar warnings de classes em pixels fixos.
    */
    <div className={`absolute top-20 right-0 w-64 rounded-lg shadow-xl border py-2 z-50 ${theme === 'dark' ? 'bg-[#404145] border-[#4a4b50]' : 'bg-white border-gray-100'}`}>
      <div className={`px-4 py-3 border-b ${theme === 'dark' ? 'border-[#4a4b50]' : 'border-gray-100'}`}>
        <p className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{nomeUsuario}</p>
        <p className="text-xs text-gray-400">{userSetor}</p>
      </div>
      
      <nav className="py-2">
        {menuItems.map((item) => {
          const Icon = (LucideIcons as any)[item.icon];
          return (
            <button 
              key={item.label} 
              type="button"
              onClick={(e) => { e.preventDefault(); item.action(); onClose(); }}
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
        <button 
          onClick={onLogout}
          className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 ${theme === 'dark' ? 'hover:bg-red-900/20' : 'hover:bg-red-50'}`}
        >
          <LucideIcons.LogOut size={18} /> Sair
        </button>
      </div>
    </div>
  );
};