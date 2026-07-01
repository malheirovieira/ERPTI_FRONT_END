import React, { useMemo, useState } from 'react';
import { Avatar } from './Avatar';
import { PESSOAS_MOCK, type PessoaSelecionavel } from '../mocks/pessoasMock';

interface Props {
  aberto: boolean;
  onFechar: () => void;
  /** Pessoas selecionadas: 1 pessoa = chat individual, 2+ = grupo (mesma lógica do Google Chat) */
  onIniciarChat: (pessoas: PessoaSelecionavel[]) => void;
}

export const NovaConversaModal: React.FC<Props> = ({ aberto, onFechar, onIniciarChat }) => {
  const [busca, setBusca] = useState('');
  const [selecionadas, setSelecionadas] = useState<PessoaSelecionavel[]>([]);

  const sugestoes = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return [];
    return PESSOAS_MOCK.filter(
      (p) =>
        !selecionadas.some((s) => s.id === p.id) &&
        (p.nome.toLowerCase().includes(termo) || p.email.toLowerCase().includes(termo))
    ).slice(0, 5);
  }, [busca, selecionadas]);

  if (!aberto) return null;

  const adicionarPessoa = (pessoa: PessoaSelecionavel) => {
    setSelecionadas((atual) => [...atual, pessoa]);
    setBusca('');
  };

  const removerPessoa = (id: number) => {
    setSelecionadas((atual) => atual.filter((p) => p.id !== id));
  };

  const handleIniciar = () => {
    if (selecionadas.length === 0) return;
    onIniciarChat(selecionadas);
    setSelecionadas([]);
    setBusca('');
  };

  const handleFechar = () => {
    setSelecionadas([]);
    setBusca('');
    onFechar();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-start justify-center pt-24 z-50" onClick={handleFechar}>
      <div
        className="bg-white rounded-xl shadow-2xl w-[420px] max-h-[70vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#dee2e6]">
          <h2 className="text-[16px] font-medium text-gray-900">Novo chat</h2>
          <button onClick={handleFechar} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-[#f1f3f4]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-3 border-b border-[#dee2e6]">
          {/* chips das pessoas já selecionadas + input, no mesmo campo (como no Google Chat) */}
          <div className="flex flex-wrap items-center gap-2 border border-[#dee2e6] rounded-lg px-3 py-2 focus-within:border-[#E95C13]">
            {selecionadas.map((p) => (
              <span
                key={p.id}
                className="flex items-center gap-1.5 bg-orange-50 text-[#E95C13] text-[12.5px] font-medium pl-1 pr-2 py-1 rounded-full"
              >
                <Avatar nome={p.nome} tamanho={18} />
                {p.nome}
                <button onClick={() => removerPessoa(p.id)} className="hover:text-[#cf4d0e]">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                  </svg>
                </button>
              </span>
            ))}
            <input
              autoFocus
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder={selecionadas.length === 0 ? 'Digite um nome ou e-mail' : 'Adicionar mais pessoas...'}
              className="flex-1 min-w-[120px] outline-none text-sm py-1"
            />
          </div>
        </div>

        {/* lista de sugestões */}
        <div className="flex-1 overflow-y-auto py-1">
          {sugestoes.map((p) => (
            <div
              key={p.id}
              onClick={() => adicionarPessoa(p)}
              className="flex items-center gap-3 px-5 py-2.5 cursor-pointer hover:bg-[#f1f3f4]"
            >
              <Avatar nome={p.nome} tamanho={32} />
              <div className="min-w-0">
                <p className="text-[13.5px] font-medium text-gray-900 truncate">{p.nome}</p>
                <p className="text-xs text-gray-500 truncate">{p.email}</p>
              </div>
            </div>
          ))}
          {busca.trim() && sugestoes.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">Nenhuma pessoa encontrada</p>
          )}
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-[#dee2e6]">
          <span className="text-xs text-gray-500">
            {selecionadas.length === 0
              ? 'Selecione uma pessoa para um chat individual ou várias para um grupo'
              : selecionadas.length === 1
              ? 'Será criado um chat individual'
              : `Será criado um grupo com ${selecionadas.length} pessoas`}
          </span>
          <button
            onClick={handleIniciar}
            disabled={selecionadas.length === 0}
            className="bg-[#E95C13] disabled:bg-gray-300 disabled:cursor-not-allowed hover:enabled:bg-[#cf4d0e] text-white text-[13px] font-semibold px-4 py-2 rounded-full shrink-0"
          >
            Iniciar chat
          </button>
        </div>
      </div>
    </div>
  );
};
