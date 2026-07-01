import React, { useMemo, useState } from 'react';
import { ConversaItem } from './ConversaItem';
import { ListaSelecaoUsuarios } from './ListaSelecaoUsuarios';
import type { Conversa, TipoConversa } from '../mocks/conversasMock';
import type { PessoaSelecionavel } from '../mocks/pessoasMock';

interface Props {
  conversas: Conversa[];
  conversaAtivaId: number;
  onSelecionar: (conversa: Conversa) => void;
  onIniciarNovoChat: (pessoas: PessoaSelecionavel[]) => void;
}

const ABAS: { key: TipoConversa; label: string }[] = [
  { key: 'individual', label: 'Conversas' },
  { key: 'grupo', label: 'Grupos' },
  { key: 'global', label: 'Global' },
];

export const ListaConversas: React.FC<Props> = ({ conversas, conversaAtivaId, onSelecionar, onIniciarNovoChat }) => {
  const [abaAtiva, setAbaAtiva] = useState<TipoConversa>('individual');
  const [busca, setBusca] = useState('');
  const [dropdownAberto, setDropdownAberto] = useState(false);

  const conversasDaAba = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return conversas
      .filter((c) => c.tipo === abaAtiva)
      .filter((c) => !termo || c.nome.toLowerCase().includes(termo));
  }, [conversas, abaAtiva, busca]);

  return (
    <aside className="w-[300px] shrink-0 border-r border-[#dee2e6] flex flex-col relative">
              <div className="px-4 pt-4 pb-2">
                <h1 className="text-[22px] font-normal text-gray-900 mb-3">Portal Chat</h1>
                <div className="flex items-center gap-2 bg-[#f8f9fa] rounded-full px-3.5 py-2 border border-transparent transition-all duration-300 focus-within:bg-white focus-within:border-[#E95C13] focus-within:ring-2 focus-within:ring-[#E95C13]/20">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Busque conversas e grupos"
            className="bg-transparent outline-none text-sm w-full"
          />
        </div>
      </div>

      <div className="px-4 pt-3 pb-1 relative">
       
      <div className={`relative transition-all duration-600 ease-in-out overflow-hidden ${dropdownAberto ? 'h-[350px]' : 'h-[42px]'}`}>
        {/* Botão: some quando aberto */}
        <div className={`absolute w-full transition-opacity duration-200 ${dropdownAberto ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <button
            onClick={() => setDropdownAberto(true)}
            className="w-full flex items-center justify-center gap-2 bg-orange-50 text-[#E95C13] hover:bg-orange-100 text-[13px] font-semibold py-2 rounded-lg transition-all duration-300"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Novo chat
          </button>
        </div>

        {/* Lista: aparece quando aberto */}
        <div className={`w-full h-full transition-opacity duration-300 delay-100 ${dropdownAberto ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <ListaSelecaoUsuarios 
            onFechar={() => setDropdownAberto(false)}
            onSelecionar={(pessoas) => {
              onIniciarNovoChat(pessoas);
              setDropdownAberto(false);
            }}
          />
        </div>
      </div>
      </div>

      <div className="flex border-b border-[#dee2e6] px-2 mt-2">
        {ABAS.map((aba) => (
          <button key={aba.key} onClick={() => setAbaAtiva(aba.key)} className={`flex-1 py-2.5 text-[13px] font-semibold border-b-2 ${abaAtiva === aba.key ? 'text-[#E95C13] border-[#E95C13]' : 'text-gray-500 border-transparent'}`}>
            {aba.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {conversasDaAba.map((conv) => (
          <ConversaItem key={conv.id} conversa={conv} ativa={conv.id === conversaAtivaId} onClick={() => onSelecionar(conv)} />
        ))}
      </div>
    </aside>
  );
};