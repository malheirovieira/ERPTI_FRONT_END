import React, { useMemo, useState } from 'react';
import { ConversaItem } from './ConversaItem';
import type { Conversa, TipoConversa } from '../mocks/conversasMock';

interface Props {
  conversas: Conversa[];
  conversaAtivaId: number;
  onSelecionar: (conversa: Conversa) => void;
  onNovoChat: () => void;
}

const ABAS: { key: TipoConversa; label: string }[] = [
  { key: 'individual', label: 'Conversas' },
  { key: 'grupo', label: 'Grupos' },
  { key: 'global', label: 'Global' },
];

export const ListaConversas: React.FC<Props> = ({ conversas, conversaAtivaId, onSelecionar, onNovoChat }) => {
  const [abaAtiva, setAbaAtiva] = useState<TipoConversa>('individual');
  const [busca, setBusca] = useState('');

  const conversasDaAba = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return conversas
      .filter((c) => c.tipo === abaAtiva)
      .filter((c) => !termo || c.nome.toLowerCase().includes(termo));
  }, [conversas, abaAtiva, busca]);

  const handleAba = (tipo: TipoConversa) => {
    setAbaAtiva(tipo);
    const primeira = conversas.find((c) => c.tipo === tipo);
    if (primeira) onSelecionar(primeira);
  };

  return (
    <aside className="w-[300px] shrink-0 border-r border-[#dee2e6] flex flex-col">
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-[22px] font-normal text-gray-900 mb-3">Bate-Papo</h1>
        <div className="flex items-center gap-2 bg-[#f8f9fa] rounded-full px-3.5 py-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            type="text"
            placeholder="Buscar pessoas, espaços..."
            className="bg-transparent outline-none text-sm w-full text-gray-700"
          />
        </div>
      </div>

      <div className="px-4 pt-3 pb-1">
        <button
          onClick={onNovoChat}
          className="w-full flex items-center justify-center gap-2 bg-orange-50 text-[#E95C13] hover:bg-orange-100 text-[13px] font-semibold py-2 rounded-full"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Novo chat
        </button>
      </div>

      <div className="flex border-b border-[#dee2e6] px-2 mt-2">
        {ABAS.map((aba) => (
          <button
            key={aba.key}
            onClick={() => handleAba(aba.key)}
            className={`flex-1 text-center py-2.5 text-[13px] font-semibold border-b-2 transition-colors ${
              abaAtiva === aba.key
                ? 'text-[#E95C13] border-[#E95C13]'
                : 'text-gray-500 border-transparent hover:text-[#E95C13]'
            }`}
          >
            {aba.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {conversasDaAba.length === 0 ? (
          <p className="text-sm text-gray-400 text-center mt-6">Nenhuma conversa por aqui ainda</p>
        ) : (
          conversasDaAba.map((conv) => (
            <ConversaItem
              key={conv.id}
              conversa={conv}
              ativa={conv.id === conversaAtivaId}
              onClick={() => onSelecionar(conv)}
            />
          ))
        )}
      </div>
    </aside>
  );
};
