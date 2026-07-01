import React, { useState, useEffect } from 'react';
import { Avatar } from './Avatar';
import { buscarTodosUsuarios } from '../services/batePapoApi';
import type { PessoaSelecionavel } from '../mocks/pessoasMock';

interface Props {
  aberto: boolean;
  onFechar: () => void;
  onIniciarChat: (pessoas: PessoaSelecionavel[]) => void;
}

export const NovaConversaModal: React.FC<Props> = ({ aberto, onFechar, onIniciarChat }) => {
  const [busca, setBusca] = useState('');
  const [todosUsuarios, setTodosUsuarios] = useState<PessoaSelecionavel[]>([]);
  const [selecionadas, setSelecionadas] = useState<PessoaSelecionavel[]>([]);

  // Carrega todos os usuários ao abrir o modal
  useEffect(() => {
    if (aberto) {
      buscarTodosUsuarios().then(setTodosUsuarios);
    }
  }, [aberto]);

  // Filtra a lista completa de acordo com o que é digitado (Dropdown)
  const sugestoes = todosUsuarios.filter(
    (p) =>
      !selecionadas.some((s) => s.id === p.id) &&
      (p.nome.toLowerCase().includes(busca.toLowerCase()) || 
       p.email.toLowerCase().includes(busca.toLowerCase()))
  );

  const adicionarPessoa = (pessoa: PessoaSelecionavel) => {
    setSelecionadas((atual) => [...atual, pessoa]);
    setBusca('');
  };

  const handleIniciar = () => {
    onIniciarChat(selecionadas);
    setSelecionadas([]);
    setBusca('');
  };

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-[450px] rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="px-5 py-4 border-b">
          <h2 className="text-lg font-semibold">Nova conversa</h2>
        </div>
        
        <div className="p-5">
          <input
            autoFocus
            className="w-full px-4 py-2 border rounded-full text-sm outline-none focus:border-[#E95C13]"
            placeholder="Buscar usuário..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto">
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
          {sugestoes.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">Nenhum usuário encontrado</p>
          )}
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t">
          <button onClick={onFechar} className="text-sm text-gray-500">Cancelar</button>
          <button
            onClick={handleIniciar}
            disabled={selecionadas.length === 0}
            className="bg-[#E95C13] text-white px-4 py-2 rounded-full text-sm disabled:opacity-50"
          >
            Iniciar Chat
          </button>
        </div>
      </div>
    </div>
  );
};