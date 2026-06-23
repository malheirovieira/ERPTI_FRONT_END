import { useState } from 'react';
import { X } from 'lucide-react';
import { useTicketStore } from '../store/useTicketStore';
import TicketChatInput from './TicketChatInput';
import type { TicketChatMensagem, TicketChatMensagemInput } from '../types/ticket';

const LARANJA = 'rgb(233, 92, 19)';

const prioridadeConfig: Record<string, string> = {
  Crítica: 'bg-red-600',
  Alta: 'bg-orange-600',
  Média: 'bg-yellow-500',
  Baixa: 'bg-green-600',
};

const statusConfig: Record<string, string> = {
  Aberto: '#FAA72A',
  'Em andamento': '#FBBD49',
  'Aguardando cliente': '#DFF368',
  Resolvido: '#FAA72A',
  Fechado: '#FBBD49',
};

export default function TicketModal() {
  const selectedTicket = useTicketStore((state) => state.selectedTicket);
  const setSelectedTicket = useTicketStore((state) => state.setSelectedTicket);

  // Histórico de mensagens do chat. Por ora fica em memória local — quando a API
  // estiver pronta, troque por um useEffect que busca as mensagens ao abrir o
  // modal (ex: GET /tickets/:id/mensagens) usando selectedTicket.id.
  const [mensagens, setMensagens] = useState<TicketChatMensagem[]>([]);

  if (!selectedTicket) return null;

  const bgPrioridade = prioridadeConfig[selectedTicket.prioridade] || 'bg-slate-500';
  const statusColor = statusConfig[selectedTicket.status] || '#DFF368';

  function fechar() {
    setSelectedTicket(null);
    setMensagens([]);
  }

  // Envia a mensagem. Aqui ela só entra no estado local — quando integrar o
  // back-end, troque por uma chamada à API (POST /tickets/:id/mensagens,
  // enviando texto + anexos via FormData) e só adicione ao estado após sucesso.
  function handleEnviarMensagem(mensagem: TicketChatMensagemInput) {
    const novaMensagem: TicketChatMensagem = {
      id: crypto.randomUUID(),
      autor: selectedTicket.usuario,
      autorTipo: 'cliente',
      enviadoEm: new Date().toISOString(),
      ...mensagem,
    };

    setMensagens((atual) => [...atual, novaMensagem]);
  }

  function formatarHora(iso: string) {
    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={fechar}
    >
      <div
        className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-2xl h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho com os dados do chamado */}
        <div className="px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <h2 className="font-bold text-slate-800 text-lg">{selectedTicket.titulo}</h2>
            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`px-3 py-1 rounded-md text-[11px] font-bold uppercase text-white ${bgPrioridade}`}
              >
                {selectedTicket.prioridade}
              </span>
              <button
                onClick={fechar}
                className="text-slate-400 hover:text-slate-600 transition-colors rounded-lg p-1 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="flex gap-2 mt-3">
            <span
              className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-md text-white"
              style={{ backgroundColor: LARANJA }}
            >
              {selectedTicket.categoria}
            </span>
            <span
              className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-md text-slate-800"
              style={{ backgroundColor: statusColor }}
            >
              {selectedTicket.status}
            </span>
          </div>

          <div className="flex justify-between text-[13px] text-slate-400 mt-3">
            <span>
              Cliente: {selectedTicket.cliente} | Usuário: {selectedTicket.usuario}
            </span>
            <span>Responsável: {selectedTicket.responsavel || 'Não atribuído'}</span>
          </div>

          <p className="text-sm text-slate-600 mt-3">{selectedTicket.descricao}</p>
        </div>

        {/* Histórico de mensagens */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 bg-slate-50">
          {mensagens.length === 0 && (
            <div className="text-center text-sm text-slate-400 py-8">
              Nenhuma mensagem ainda. Escreva abaixo para iniciar a conversa.
            </div>
          )}

          {mensagens.map((msg) => {
            const ehCliente = msg.autorTipo === 'cliente';
            return (
              <div key={msg.id} className={`flex ${ehCliente ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] ${ehCliente ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div
                    className={`rounded-xl px-4 py-2.5 text-sm ${
                      ehCliente ? 'text-white rounded-br-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm'
                    }`}
                    style={ehCliente ? { backgroundColor: LARANJA } : undefined}
                  >
                    {msg.texto && <p className="whitespace-pre-wrap">{msg.texto}</p>}

                    {msg.anexos.length > 0 && (
                      <ul className={`space-y-1 ${msg.texto ? 'mt-2' : ''}`}>
                        {msg.anexos.map((anexo) => (
                          <li
                            key={anexo.nome}
                            className={`text-xs underline ${ehCliente ? 'text-white/90' : 'text-slate-500'}`}
                          >
                            {anexo.nome}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 px-1">
                    {msg.autor} · {formatarHora(msg.enviadoEm)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input de chat fixo no rodapé */}
        <TicketChatInput onSend={handleEnviarMensagem} />
      </div>
    </div>
  );
}