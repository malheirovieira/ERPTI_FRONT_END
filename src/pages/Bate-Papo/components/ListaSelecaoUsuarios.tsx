import React, { useState, useEffect, useRef } from 'react';
import { Avatar } from './Avatar';
import { buscarTodosUsuarios } from '../services/batePapoApi';
import type { PessoaSelecionavel } from '../mocks/pessoasMock';

interface Props {
  onSelecionar: (pessoas: PessoaSelecionavel[]) => void;
  onFechar: () => void;
}

export const ListaSelecaoUsuarios: React.FC<Props> = ({ onSelecionar, onFechar }) => {
  const [usuarios, setUsuarios] = useState<PessoaSelecionavel[]>([]);
  const [busca, setBusca] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    buscarTodosUsuarios().then(setUsuarios);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onFechar();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onFechar]);

  const filtrados = usuarios.filter((u) =>
    u.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <>
      {/* CSS para esconder o scrollbar sem perder a funcionalidade */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div 
        ref={dropdownRef}
        // Adicionada a classe border-2 e border-[#E95C13] para dar o destaque laranja solicitado
        className="w-full h-full bg-white border-2 border-[#E95C13]/85 shadow-lg rounded-xl overflow-hidden flex flex-col transition-all duration-300"
      >
        <div className="p-2 border-b border-orange-100 bg-orange-50/50 shrink-0">
          <input
            autoFocus
            className="
              w-full px-3 py-2 text-sm outline-none 
              bg-gray-50/50 
              border border-orange-200 rounded-lg 
              focus:bg-white 
              focus:border-[#e95a139e] 
              focus:ring-2 focus:ring-[#E95C13]/20 
              transition-all duration-300
            "
            placeholder="Buscar usuário..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {filtrados.length > 0 ? (
            filtrados.map((u) => (
              <div
                key={u.id}
                onClick={() => { onSelecionar([u]); onFechar(); }}
                className="flex items-center gap-3 px-4 py-3 hover:bg-orange-50 cursor-pointer transition-colors border-b border-gray-50 last:border-none"
              >
                <Avatar nome={u.nome} tamanho={32} />
                <div className="flex flex-col">
                  <span className="text-[14px] font-medium text-gray-800">{u.nome}</span>
                  <span className="text-[11px] text-gray-400">{u.email}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="p-4 text-sm text-gray-400 text-center">Nenhum encontrado</p>
          )}
        </div>
      </div>
    </>
  );
};