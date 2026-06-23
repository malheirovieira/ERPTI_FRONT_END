import { useState, useEffect, useRef } from 'react';
import { X, Paperclip, Send, FileText } from 'lucide-react';
import { useTicketStore } from '../store/useTicketStore';
import type { TicketChatMensagem, TicketAnexo } from '../types/ticket';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
// Importação do seu arquivo de configuração centralizado
import { API_URL, getAuthHeaders } from '../../../../services/api'; 

const LARANJA = 'rgb(233, 92, 19)';
const TAMANHO_MAXIMO_MB = 10;

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

  // Estados do histórico e envio
  const [mensagens, setMensagens] = useState<TicketChatMensagem[]>([]);
  const [carregandoMensagens, setCarregandoMensagens] = useState(false);
  const [enviandoMensagem, setEnviandoMensagem] = useState(false);

  // Estados do Chat Input acoplados
  const [texto, setTexto] = useState('');
  const [anexos, setAnexos] = useState<TicketAnexo[]>([]);
  const [erroInput, setErroInput] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputArquivoRef = useRef<HTMLInputElement>(null);
  
  // Ref para guardar a conexão do STOMP ativa e não perder a referência nos renders
  const stompClientRef = useRef<Stomp.Client | null>(null);

  const disabled = enviandoMensagem || carregandoMensagens;
  const podeEnviar = (texto.trim() !== '' || anexos.length > 0) && !disabled;

  // 1. CARREGAR HISTÓRICO E CONECTAR WEBSOCKET
  useEffect(() => {
    if (!selectedTicket) {
      setMensagens([]);
      return;
    }

    // --- CARREGA O HISTÓRICO ANTIGO ---
    async function carregarHistoricoChat() {
      try {
        setCarregandoMensagens(true);
        const response = await fetch(`${API_URL}/chamados/${selectedTicket.id}/mensagens`, {
          method: 'GET',
          headers: getAuthHeaders() // Utiliza os headers estruturados do api.ts
        });
        
        if (response.ok) {
          const dados = await response.json();
          const mensagensFormatadas: TicketChatMensagem[] = dados.map((msg: any) => ({
            id: msg.id?.toString() || crypto.randomUUID(),
            autor: msg.usuarioEnvio?.nome || msg.remetenteNome || 'Sistema',
            autorTipo: (msg.usuarioEnvio?.role === 'ADMIN' || msg.usuarioEnvio?.role === 'TECNICO') ? 'tecnico' : 'cliente',
            texto: msg.mensagem,
            enviadoEm: msg.dataEnvio,
            anexos: msg.anexos || [],
          }));
          setMensagens(mensagensFormatadas);
        }
      } catch (error) {
        console.error("Erro ao buscar histórico do chat:", error);
      } finally {
        setCarregandoMensagens(false);
      }
    }

    carregarHistoricoChat();

    // --- CONECTA AO WEBSOCKET ---
    const token = localStorage.getItem('token');
    if (token) {
      const socket = new SockJS(`${API_URL}/ws-gestao`);
      const stomp = Stomp.over(socket);
      
      stompClientRef.current = stomp;

      stomp.connect({ 'Authorization': `Bearer ${token}` }, () => {
        console.log(`Conectado à sala do Chamado ${selectedTicket.id}`);

        // Inscreve no tópico para ouvir as mensagens chegando em tempo real
        stomp.subscribe(`/topic/chamado/${selectedTicket.id}`, (resposta) => {
          const msgRecebida = JSON.parse(resposta.body);

          setMensagens((atual) => {
            if (atual.some(m => m.id === msgRecebida.id?.toString())) return atual;

            const novaMensagem: TicketChatMensagem = {
              id: msgRecebida.id?.toString() || crypto.randomUUID(),
              autor: msgRecebida.remetenteNome || msgRecebida.usuarioEnvio?.nome || 'Sistema',
              autorTipo: (msgRecebida.role === 'USER') ? 'cliente' : 'tecnico', 
              enviadoEm: msgRecebida.dataEnvio || new Date().toISOString(),
              texto: msgRecebida.mensagem,
              anexos: msgRecebida.anexos || []
            };

            return [...atual, novaMensagem];
          });
        });
      }, (error) => {
        console.error('Erro ao conectar no WebSocket:', error);
      });
    }

    // --- CLEANUP: DESCONECTA AO FECHAR O MODAL ---
    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.disconnect(() => {
          console.log(`Desconectado do Chamado ${selectedTicket.id}`);
        });
      }
    };
  }, [selectedTicket]);

  if (!selectedTicket) return null;

  const bgPrioridade = prioridadeConfig[selectedTicket.prioridade] || 'bg-slate-500';
  const statusColor = statusConfig[selectedTicket.status] || '#DFF368';

  function fechar() {
    setSelectedTicket(null);
    setMensagens([]);
    setTexto('');
    setAnexos([]);
    setErroInput('');
  }

  // --- Funções Auxiliares de Arquivos e Texto ---
  function ajustarAltura(el: HTMLTextAreaElement) {
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }

  function atualizarTexto(valor: string) {
    setTexto(valor);
    if (textareaRef.current) ajustarAltura(textareaRef.current);
  }

  function adicionarArquivos(arquivos: FileList | null) {
    if (!arquivos) return;
    const novos: TicketAnexo[] = [];

    for (const arquivo of Array.from(arquivos)) {
      if (arquivo.size > TAMANHO_MAXIMO_MB * 1024 * 1024) {
        setErroInput(`"${arquivo.name}" excede o limite de ${TAMANHO_MAXIMO_MB}MB.`);
        continue;
      }
      novos.push({ nome: arquivo.name, tamanho: arquivo.size, tipo: arquivo.type, arquivo });
    }

    if (novos.length > 0) {
      setErroInput('');
      setAnexos((atual) => [...atual, ...novos]);
    }
  }

  function removerAnexo(nome: string) {
    setAnexos((atual) => atual.filter((a) => a.nome !== nome));
    if (inputArquivoRef.current) inputArquivoRef.current.value = '';
  }

  function formatarTamanho(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function formatarHora(iso: string) {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  // 3. ENVIO DA MENSAGEM (WebSocket ou HTTP)
  async function enviar() {
    if (!podeEnviar) return;

    try {
      setEnviandoMensagem(true);

      // CASO 1: A mensagem possui arquivos anexos (Envia via HTTP POST multipart)
      if (anexos.length > 0) {
        const formData = new FormData();
        formData.append('mensagem', texto.trim());
        anexos.forEach((anexo) => {
          if (anexo.arquivo) formData.append('arquivos', anexo.arquivo);
        });

        const response = await fetch(`${API_URL}/chamados/${selectedTicket.id}/mensagens`, {
          method: 'POST',
          headers: getAuthHeaders(true), // Passa "true" para omitir Content-Type e deixar o navegador definir o boundary do FormData
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Erro ao enviar anexos.');
        }
      } 
      // CASO 2: A mensagem é puramente texto (Envia via WebSocket/STOMP)
      else {
        if (stompClientRef.current && stompClientRef.current.connected) {
          const chatMessage = { mensagem: texto.trim() };
          stompClientRef.current.send(`/app/chamado/${selectedTicket.id}/enviar`, {}, JSON.stringify(chatMessage));
        } else {
          setErroInput("Você não está conectado ao chat. Feche e abra o chamado novamente.");
          return;
        }
      }

      // Limpa os campos da interface imediatamente após o sucesso
      setTexto('');
      setAnexos([]);
      setErroInput('');
      if (inputArquivoRef.current) inputArquivoRef.current.value = '';
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.value = '';
      }

    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      setErroInput("Falha ao enviar mensagem.");
    } finally {
      setEnviandoMensagem(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
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
        {/* Cabeçalho */}
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
          {carregandoMensagens ? (
            <div className="text-center text-sm text-slate-400 py-8">Carregando mensagens...</div>
          ) : mensagens.length === 0 ? (
            <div className="text-center text-sm text-slate-400 py-8">
              Nenhuma mensagem ainda. Escreva abaixo para iniciar a conversa.
            </div>
          ) : (
            mensagens.map((msg) => {
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

                      {msg.anexos && msg.anexos.length > 0 && (
                        <ul className={`space-y-1 ${msg.texto ? 'mt-2' : ''}`}>
                          {msg.anexos.map((anexo) => (
                            <li
                              key={anexo.nome}
                              className={`text-xs underline ${ehCliente ? 'text-white/90' : 'text-slate-500'}`}
                            >
                              <a href={anexo.url} target="_blank" rel="noreferrer">
                                {anexo.nome}
                              </a>
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
            })
          )}
        </div>

        {/* Formulário de Input de Chat */}
        <div className="p-4 bg-white border-t border-slate-100 rounded-b-xl">
          <div className="border border-slate-200 rounded-2xl bg-white px-4 py-3">
            {anexos.length > 0 && (
              <ul className="flex flex-wrap gap-2 mb-2">
                {anexos.map((anexo) => (
                  <li
                    key={anexo.nome}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <FileText size={13} className="text-slate-400 shrink-0" />
                    <span className="text-slate-600 max-w-35 truncate">{anexo.nome}</span>
                    <span className="text-slate-400 shrink-0">{formatarTamanho(anexo.tamanho)}</span>
                    <button
                      type="button"
                      onClick={() => removerAnexo(anexo.nome)}
                      className="text-slate-400 hover:text-red-500 transition-colors shrink-0"
                    >
                      <X size={13} />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {erroInput && <div className="text-xs text-red-600 mb-2">{erroInput}</div>}

            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={() => inputArquivoRef.current?.click()}
                disabled={disabled}
                className="shrink-0 p-2.5 rounded-full text-slate-400 hover:text-[rgb(233,92,19)] hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Anexar arquivo"
              >
                <Paperclip size={19} />
              </button>
              <input
                ref={inputArquivoRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => adicionarArquivos(e.target.files)}
              />

              <textarea
                ref={textareaRef}
                value={texto}
                onChange={(e) => atualizarTexto(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escreva uma mensagem..."
                disabled={disabled}
                rows={1}
                className="flex-1 resize-none px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 outline-none focus:bg-white focus:border-[rgb(233,92,19)] focus:ring-2 focus:ring-orange-100 transition-colors disabled:opacity-50 max-h-40"
              />

              <button
                type="button"
                onClick={enviar}
                disabled={!podeEnviar}
                className="shrink-0 p-2.5 rounded-full text-white transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: LARANJA }}
                title="Enviar mensagem"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}