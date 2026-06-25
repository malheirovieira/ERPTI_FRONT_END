import { formatarStatus } from '../utils/ticketUtils';
import { useState, useEffect, useRef } from 'react';
import { X, Paperclip, Send, FileText } from 'lucide-react';
import { useTicketStore } from '../store/useTicketStore';
import type { TicketChatMensagem, TicketAnexo } from '../types/ticket';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { API_URL, getAuthHeaders } from '../../../../services/api';

const LARANJA = 'rgb(233, 92, 19)';
const TAMANHO_MAXIMO_MB = 10;

const prioridadeConfig: Record<string, string> = {
  'Crítica': 'bg-red-600', 'CRÍTICA': 'bg-red-600', 'CRITICA': 'bg-red-600',
  'Alta': 'bg-orange-600', 'ALTA': 'bg-orange-600',
  'Média': 'bg-yellow-500', 'MÉDIA': 'bg-yellow-500', 'MEDIA': 'bg-yellow-500',
  'Baixa': 'bg-green-600', 'BAIXA': 'bg-green-600',
};

const statusConfig: Record<string, string> = {
  'Aberto': '#FAA72A', 'ABERTO': '#FAA72A',
  'Em andamento': '#B3EBF2', 'Em Andamento': '#B3EBF2',
  'EM ANDAMENTO': '#B3EBF2', 'EM_ANDAMENTO': '#B3EBF2',
  'Finalizado': '#dff368', 'FECHADO': '#dff368',
};

function UserAvatar({ nome, size = 'sm', clickable = false, onClick, extraClass = '' }: {
  nome: string;
  size?: 'sm' | 'md';
  clickable?: boolean;
  onClick?: () => void;
  extraClass?: string;
}) {
  const partes = nome.split(' ').filter(Boolean);
  let iniciais: string;
  if (partes.length === 0) {
    iniciais = '?';
  } else if (partes.length === 1) {
    iniciais = partes[0][0].toUpperCase();
  } else {
    iniciais = (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }
  const sizeClass = size === 'md' ? 'w-8 h-8 text-[13px]' : 'w-6 h-6 text-[10px]';
  return (
    <>
      <style>{`
        .avatar-clickable {
          cursor: pointer;
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .avatar-clickable:hover { transform: scale(1.12); }
        .avatar-clickable:active { transform: scale(0.96); transition-duration: 0.1s; }
      `}</style>
      <span
        onClick={onClick}
        className={`inline-flex items-center justify-center rounded-full font-bold text-white shrink-0 ${sizeClass} ${clickable ? 'avatar-clickable' : ''} ${extraClass}`}
        style={{ backgroundColor: LARANJA }}
        title={nome}
      >
        {iniciais}
      </span>
    </>
  );
}

export default function TicketModal() {
  const selectedTicket = useTicketStore((state) => state.selectedTicket);
  const setSelectedTicket = useTicketStore((state) => state.setSelectedTicket);
  const updateTicket = useTicketStore((state: any) => state.updateTicket);
  const fetchTickets = useTicketStore((state: any) => state.fetchTickets); // ← NOVO

  const [mensagens, setMensagens] = useState<TicketChatMensagem[]>([]);
  const [carregandoMensagens, setCarregandoMensagens] = useState(false);
  const [enviandoMensagem, setEnviandoMensagem] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState<{ id: number; nome: string; email: string; role?: string } | null>(null);
  const [texto, setTexto] = useState('');
  const [anexos, setAnexos] = useState<TicketAnexo[]>([]);
  const [erroInput, setErroInput] = useState('');

  const [modalParticipanteAberto, setModalParticipanteAberto] = useState(false);
  const [participantesNoChamado, setParticipantesNoChamado] = useState<{ id: number; nome: string; email: string; papel: string }[]>([]);
  const [usuariosDisponiveis, setUsuariosDisponiveis] = useState<{ id: number; nome: string; email: string; role: string; setor?: string }[]>([]);
  const [carregandoUsuarios, setCarregandoUsuarios] = useState(false);
  const [adicionandoId, setAdicionandoId] = useState<number | null>(null);
  const [removendoId, setRemovendoId] = useState<number | null>(null);
  const [feedbackParticipante, setFeedbackParticipante] = useState<{ tipo: 'ok' | 'erro'; msg: string } | null>(null);
  const [filtroBusca, setFiltroBusca] = useState('');
  const [filtroSetor, setFiltroSetor] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputArquivoRef = useRef<HTMLInputElement>(null);
  const stompClientRef = useRef<Stomp.Client | null>(null);
  const modalParticipanteRef = useRef<HTMLDivElement>(null);

  const disabled = enviandoMensagem || carregandoMensagens;
  const statusFormatado = selectedTicket?.status?.trim().toUpperCase() || '';
  const isFinalizado = statusFormatado === 'FECHADO' || statusFormatado === 'FINALIZADO';
  const podeEnviar = !isFinalizado && (texto.trim() !== '' || anexos.length > 0) && !disabled;

  useEffect(() => {
    async function carregarPerfilUsuario() {
      try {
        const response = await fetch(`${API_URL}/usuarios/me`, { method: 'GET', headers: getAuthHeaders() });
        if (response.ok) setUsuarioLogado(await response.json());
      } catch (error) {
        console.error('Erro ao obter dados do usuário logado:', error);
      }
    }
    carregarPerfilUsuario();
  }, []);

  useEffect(() => {
    if (!selectedTicket) {
      setMensagens([]);
      setParticipantesNoChamado([]);
      return;
    }

    setParticipantesNoChamado([]);

    async function carregarHistoricoChat() {
      try {
        setCarregandoMensagens(true);
        const response = await fetch(`${API_URL}/chamados/${selectedTicket.id}/mensagens`, { method: 'GET', headers: getAuthHeaders() });
        if (response.ok) {
          const dados = await response.json();
          setMensagens(dados.map((msg: any) => ({
            id: msg.id?.toString() || crypto.randomUUID(),
            autor: msg.usuarioEnvio?.nome || msg.remetenteNome || 'Sistema',
            autorEmail: msg.usuarioEnvio?.email || msg.remetenteEmail || null,
            texto: msg.mensagem,
            enviadoEm: msg.dataEnvio,
            anexos: msg.anexos || [],
          })));
        }
      } catch (error) {
        console.error('Erro ao buscar histórico do chat:', error);
      } finally {
        setCarregandoMensagens(false);
      }
    }

    async function carregarParticipantesIniciais() {
      try {
        const res = await fetch(`${API_URL}/chamados/${selectedTicket.id}/participantes`, { headers: getAuthHeaders() });
        if (res.ok) {
          const dados = await res.json();
          setParticipantesNoChamado(
            dados.map((p: any) => ({
              id: p.usuario?.id ?? p.id,
              nome: p.usuario?.nome ?? p.nome ?? '?',
              email: p.usuario?.email ?? p.email ?? '',
              papel: p.papel ?? 'OBSERVADOR',
            }))
          );
        }
      } catch {
        // silencioso
      }
    }

    carregarHistoricoChat();
    carregarParticipantesIniciais();

    const token = localStorage.getItem('token');
    if (token) {
      const socket = new SockJS(`${API_URL}/ws-gestao`);
      const stomp = Stomp.over(socket);
      stompClientRef.current = stomp;
      stomp.connect({ 'Authorization': `Bearer ${token}` }, () => {
        stomp.subscribe(`/topic/chamado/${selectedTicket.id}`, (resposta) => {
          const msgRecebida = JSON.parse(resposta.body);
          setMensagens((atual) => {
            if (atual.some(m => m.id === msgRecebida.id?.toString())) return atual;
            return [...atual, {
              id: msgRecebida.id?.toString() || crypto.randomUUID(),
              autor: msgRecebida.remetenteNome || msgRecebida.usuarioEnvio?.nome || 'Sistema',
              autorEmail: msgRecebida.usuarioEnvio?.email || msgRecebida.remetenteEmail || null,
              enviadoEm: msgRecebida.dataEnvio || new Date().toISOString(),
              texto: msgRecebida.mensagem,
              anexos: msgRecebida.anexos || [],
            } as any];
          });
        });
      }, (error: any) => {
        console.error('Erro ao conectar no WebSocket:', error);
      });
    }

    return () => {
      stompClientRef.current?.disconnect(() => {
        console.log(`Desconectado do Chamado ${selectedTicket.id}`);
      });
    };
  }, [selectedTicket]);

  useEffect(() => {
    if (!modalParticipanteAberto) return;
    function handleClickFora(e: MouseEvent) {
      if (modalParticipanteRef.current && !modalParticipanteRef.current.contains(e.target as Node)) {
        setModalParticipanteAberto(false);
      }
    }
    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, [modalParticipanteAberto]);

  if (!selectedTicket) return null;

  const bgPrioridade = prioridadeConfig[selectedTicket.prioridade] || prioridadeConfig[selectedTicket.prioridade?.toUpperCase()] || 'bg-slate-500';
  const statusColor = statusConfig[formatarStatus(selectedTicket.status)] || statusConfig[formatarStatus(selectedTicket.status).toUpperCase()] || '#DFF368';
  const roleFormatada = usuarioLogado?.role?.trim().toUpperCase() || '';
  const ehTecnicoOuAdmin = roleFormatada === 'TECNICO' || roleFormatada === 'ADMIN';
  const semResponsavel = !selectedTicket.responsavel || selectedTicket.responsavel.trim() === '' || selectedTicket.responsavel === 'Não atribuído';

  const ehCriador = !!usuarioLogado && (
    usuarioLogado.nome === (selectedTicket.usuario || selectedTicket.usuarioAbriu?.nome) ||
    usuarioLogado.id === selectedTicket.usuarioAbriu?.id
  );
  const podeConvidar = ehTecnicoOuAdmin || ehCriador;

  function fechar() {
    setSelectedTicket(null);
    setMensagens([]);
    setTexto('');
    setAnexos([]);
    setErroInput('');
  }

  async function handleAssumirChamado() {
    try {
      const response = await fetch(`${API_URL}/chamados/${selectedTicket.id}/assumir`, { method: 'PUT', headers: getAuthHeaders() });
      if (response.ok) {
        const chamadoAtualizado = await response.json();
        const ticketFormatado = {
          ...selectedTicket,
          status: chamadoAtualizado.status ?? 'EM_ANDAMENTO',
          responsavel: chamadoAtualizado.tecnicoPrincipal?.nome || usuarioLogado?.nome || 'Responsável',
        };
        setSelectedTicket(ticketFormatado);
        if (updateTicket) updateTicket(ticketFormatado);
      }
    } catch {
      setErroInput('Erro ao assumir chamado.');
    }
  }

  async function handleFinalizarChamado(statusDestino: string) {
    try {
      const response = await fetch(`${API_URL}/chamados/${selectedTicket.id}`, {
        method: 'PUT',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statusDestino }),
      });
      if (response.ok) {
        const ticketAtualizado = { ...selectedTicket, status: statusDestino as any };
        setSelectedTicket(ticketAtualizado);
        if (updateTicket) updateTicket(ticketAtualizado);
      } else {
        setErroInput(`Erro ao ${statusDestino === 'FECHADO' ? 'finalizar' : 'reabrir'} chamado.`);
      }
    } catch {
      setErroInput('Erro de conexão.');
    }
  }

  async function abrirModalParticipante() {
    setModalParticipanteAberto(true);
    setFeedbackParticipante(null);
    setFiltroBusca('');
    setFiltroSetor('');
    setCarregandoUsuarios(true);
    try {
      const [resUsuarios, resParticipantes] = await Promise.all([
        fetch(`${API_URL}/usuarios`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/chamados/${selectedTicket.id}/participantes`, { headers: getAuthHeaders() }),
      ]);

      const todosUsuarios = resUsuarios.ok ? await resUsuarios.json() : [];
      const participantes = resParticipantes.ok ? await resParticipantes.json() : [];

      const idsNoCall = new Set<number>();
      if (selectedTicket.usuarioAbriu?.id) idsNoCall.add(selectedTicket.usuarioAbriu.id);
      if ((selectedTicket as any).tecnicoPrincipal?.id) idsNoCall.add((selectedTicket as any).tecnicoPrincipal.id);
      participantes.forEach((p: any) => p.usuario?.id && idsNoCall.add(p.usuario.id));

      setParticipantesNoChamado(
        participantes.map((p: any) => ({
          id: p.usuario?.id,
          nome: p.usuario?.nome || '?',
          email: p.usuario?.email || '',
          papel: p.papel || 'OBSERVADOR',
        }))
      );

      setUsuariosDisponiveis(
        todosUsuarios
          .filter((u: any) => {
            if (u.bloqueado || u.ativo === false) return false;
            return !idsNoCall.has(u.id);
          })
          .map((u: any) => ({
            id: u.id,
            nome: u.nome || '',
            email: u.email || '',
            role: u.role || '',
            setor: u.departamento?.nome || u.setor || u.departamento || '',
          }))
      );
    } catch {
      setFeedbackParticipante({ tipo: 'erro', msg: 'Erro ao carregar usuários.' });
    } finally {
      setCarregandoUsuarios(false);
    }
  }

  async function adicionarParticipante(idUsuario: number) {
    setAdicionandoId(idUsuario);
    setFeedbackParticipante(null);
    try {
      const response = await fetch(`${API_URL}/chamados/${selectedTicket.id}/participantes`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ idUsuario, papel: 'OBSERVADOR' }),
      });
      const msg = await response.text();
      if (response.ok) {
        setFeedbackParticipante({ tipo: 'ok', msg });
        const novoParticipante = usuariosDisponiveis.find((u) => u.id === idUsuario);
        if (novoParticipante) {
          setParticipantesNoChamado((prev) => [...prev, { ...novoParticipante, papel: 'OBSERVADOR' }]);
          setUsuariosDisponiveis((prev) => prev.filter((u) => u.id !== idUsuario));
        }
        fetchTickets(); // ← atualiza a lista em tempo real
      } else {
        setFeedbackParticipante({ tipo: 'erro', msg: msg || 'Erro ao adicionar participante.' });
      }
    } catch {
      setFeedbackParticipante({ tipo: 'erro', msg: 'Erro de conexão.' });
    } finally {
      setAdicionandoId(null);
    }
  }

  async function removerParticipante(idUsuario: number, nomeUsuario: string) {
    setRemovendoId(idUsuario);
    setFeedbackParticipante(null);
    try {
      const response = await fetch(`${API_URL}/chamados/${selectedTicket.id}/participantes/${idUsuario}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const msg = await response.text();
      if (response.ok) {
        setFeedbackParticipante({ tipo: 'ok', msg: msg || `${nomeUsuario} removido do chamado.` });
        const removido = participantesNoChamado.find((p) => p.id === idUsuario);
        setParticipantesNoChamado((prev) => prev.filter((p) => p.id !== idUsuario));
        if (removido) {
          setUsuariosDisponiveis((prev) => [...prev, { id: removido.id, nome: removido.nome, email: removido.email, role: '' }]);
        }
        fetchTickets(); // ← atualiza a lista em tempo real
      } else {
        setFeedbackParticipante({ tipo: 'erro', msg: msg || 'Erro ao remover participante.' });
      }
    } catch {
      setFeedbackParticipante({ tipo: 'erro', msg: 'Erro de conexão.' });
    } finally {
      setRemovendoId(null);
    }
  }

  function ajustarAltura(el: HTMLTextAreaElement) {
    el.style.height = 'auto';
    const novaAltura = Math.max(el.scrollHeight, 40);
    el.style.height = `${Math.min(novaAltura, 160)}px`;
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
    if (novos.length > 0) { setErroInput(''); setAnexos((atual) => [...atual, ...novos]); }
  }

  function removerAnexo(nome: string) {
    setAnexos((atual) => atual.filter((a) => a.nome !== nome));
    if (inputArquivoRef.current) inputArquivoRef.current.value = '';
  }

  const formatarHora = (iso: string) => {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  async function enviar() {
    if (!podeEnviar) return;
    try {
      setEnviandoMensagem(true);
      const token = localStorage.getItem('token');
      if (anexos.length > 0) {
        const formData = new FormData();
        formData.append('mensagem', texto.trim());
        anexos.forEach((anexo) => { if (anexo.arquivo) formData.append('arquivo', anexo.arquivo); });
        const response = await fetch(`${API_URL}/chamados/${selectedTicket.id}/anexos`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData,
        });
        if (!response.ok) throw new Error('Erro ao enviar anexos.');
      } else {
        if (stompClientRef.current?.connected) {
          stompClientRef.current.send(`/app/chamado/${selectedTicket.id}/enviar`, {}, JSON.stringify({ mensagem: texto.trim() }));
        } else {
          setErroInput('Você não está conectado ao chat.');
          return;
        }
      }
      setTexto('');
      setAnexos([]);
      if (textareaRef.current) textareaRef.current.style.height = '40px';
    } catch {
      setErroInput('Falha ao enviar.');
    } finally {
      setEnviandoMensagem(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar(); }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={fechar}>
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-2xl h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>

        <div className="px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <h2 className="font-bold text-slate-800 text-lg">{selectedTicket.titulo}</h2>
            <div className="flex items-center gap-2 shrink-0">
              {ehTecnicoOuAdmin && (
                <>
                  <style>{`.btn-acao { transition: all 0.2s ease-in-out; }`}</style>

                  {(statusFormatado === 'ABERTO' || ((statusFormatado === 'EM_ANDAMENTO' || statusFormatado === 'EM ANDAMENTO') && semResponsavel)) && (
                    <button onClick={handleAssumirChamado} className="btn-acao flex items-center justify-center px-4 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:border-[rgb(233,92,19)] hover:text-[rgb(233,92,19)] hover:bg-orange-50 active:scale-95 cursor-pointer mr-1">
                      Assumir chamado
                    </button>
                  )}

                  {statusFormatado !== 'FECHADO' && statusFormatado !== 'FINALIZADO' && (statusFormatado === 'EM_ANDAMENTO' || statusFormatado === 'EM ANDAMENTO') && (!semResponsavel && (selectedTicket.responsavel === usuarioLogado?.nome || roleFormatada === 'ADMIN')) && (
                    <button onClick={() => handleFinalizarChamado('FECHADO')} className="btn-acao flex items-center justify-center px-4 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:border-[rgb(233,92,19)] hover:text-[rgb(233,92,19)] hover:bg-orange-50 active:scale-95 cursor-pointer">
                      Finalizar chamado
                    </button>
                  )}

                  {isFinalizado && (
                    <button onClick={() => handleFinalizarChamado('EM_ANDAMENTO')} className="btn-acao flex items-center justify-center px-4 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:border-[rgb(233,92,19)] hover:text-[rgb(233,92,19)] hover:bg-orange-50 active:scale-95 cursor-pointer">
                      Reabrir chamado
                    </button>
                  )}

                  <div className="w-px h-5 bg-slate-200 mx-1" />
                </>
              )}
              <span className={`px-3 py-1 rounded-md text-[11px] font-bold uppercase text-white ${bgPrioridade}`}>{selectedTicket.prioridade}</span>
              <button onClick={fechar} className="text-slate-400 hover:text-slate-600 transition-colors rounded-lg p-1 hover:bg-slate-100"><X size={20} /></button>
            </div>
          </div>

          <div className="flex gap-2 mt-3 items-center">
            <span className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-md text-white" style={{ backgroundColor: LARANJA }}>
              {selectedTicket.cliente || selectedTicket.empresa}
            </span>
            <span className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-md text-white" style={{ backgroundColor: LARANJA }}>
              {selectedTicket.categoria}
            </span>
            <span className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-md text-slate-800" style={{ backgroundColor: statusColor }}>
              {formatarStatus(selectedTicket.status)}
            </span>
          </div>

          <div className="flex justify-between items-center mt-4 relative">
            <div className="flex items-center">
              <style>{`
                .avatar-stack { display: flex; align-items: center; }
                .avatar-stack-item {
                  width: 32px; height: 32px; border-radius: 50%;
                  border: 2px solid white;
                  margin-left: -10px;
                  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
                  position: relative;
                  z-index: 2;
                }
                .avatar-stack-item:first-child { margin-left: 0; }
                .avatar-stack-item:hover { transform: scale(1.12); z-index: 10; }
                .avatar-add-btn {
                  width: 32px; height: 32px; border-radius: 50%;
                  border: 2px solid white;
                  margin-left: -10px;
                  position: relative;
                  z-index: 1;
                  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
                  flex-shrink: 0;
                  cursor: pointer;
                  display: inline-flex;
                  align-items: center;
                  justify-content: center;
                }
                .avatar-add-btn:hover { transform: scale(1.12); }
              `}</style>
              <div className="avatar-stack">
                {(selectedTicket.usuario || selectedTicket.usuarioAbriu?.nome) && (
                  <UserAvatar
                    nome={selectedTicket.usuario || selectedTicket.usuarioAbriu?.nome || '?'}
                    size="md"
                    extraClass="avatar-stack-item"
                  />
                )}
                {participantesNoChamado.map((p) => (
                  <UserAvatar
                    key={p.id}
                    nome={p.nome}
                    size="md"
                    extraClass="avatar-stack-item"
                  />
                ))}
                {podeConvidar && (
                  <button
                    onClick={abrirModalParticipante}
                    title="Convidar participante"
                    className="avatar-add-btn"
                    style={{ backgroundColor: '#f1f5f9' }}
                  >
                    <svg viewBox="0 0 24 24" width="13" height="13" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" fill="none">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            <span className="text-[12px] font-semibold text-slate-500">
              Responsável: <span className="text-slate-700">{selectedTicket.responsavel || 'Não atribuído'}</span>
            </span>

            {modalParticipanteAberto && (
              <div
                ref={modalParticipanteRef}
                className="absolute left-0 top-10 z-50 w-80 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                  <span className="text-[13px] font-bold text-slate-700">Participantes</span>
                  <button onClick={() => setModalParticipanteAberto(false)} className="text-slate-400 hover:text-slate-600"><X size={15} /></button>
                </div>

                {feedbackParticipante && (
                  <div className={`mx-3 mt-2 px-3 py-2 rounded-lg text-[11px] font-medium ${feedbackParticipante.tipo === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                    {feedbackParticipante.msg}
                  </div>
                )}

                {carregandoUsuarios ? (
                  <div className="text-center text-[12px] text-slate-400 py-8">Carregando...</div>
                ) : (
                  <>
                    <div className="px-4 pt-3 pb-1">
                      <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wide mb-2">No chamado</p>
                      <div className="flex items-center gap-2.5 py-1.5">
                        <UserAvatar nome={selectedTicket.usuario || selectedTicket.usuarioAbriu?.nome || '?'} size="md" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-semibold text-slate-700 truncate">{selectedTicket.usuario || selectedTicket.usuarioAbriu?.nome}</p>
                          <p className="text-[10px] text-slate-400">Criador</p>
                        </div>
                      </div>
                      {participantesNoChamado.map((p) => (
                        <div key={p.id} className="flex items-center gap-2.5 py-1.5 group/item">
                          <UserAvatar nome={p.nome} size="md" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-semibold text-slate-700 truncate">{p.nome}</p>
                            <p className="text-[10px] text-slate-400">{p.papel === 'OBSERVADOR' ? 'Participante' : p.papel.toLowerCase().replace('_', ' ')}</p>
                          </div>
                          {podeConvidar && (
                            <button
                              onClick={() => removerParticipante(p.id, p.nome)}
                              disabled={removendoId === p.id}
                              title={`Remover ${p.nome}`}
                              className="shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity px-2 py-1 text-[10px] font-semibold text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md disabled:opacity-40"
                            >
                              {removendoId === p.id ? '...' : 'Remover'}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {podeConvidar && (() => {
                      const setoresUnicos = Array.from(
                        new Set(usuariosDisponiveis.map((u) => u.setor).filter(Boolean))
                      ).sort() as string[];

                      const usuariosFiltrados = usuariosDisponiveis
                        .filter((u) => {
                          const buscaOk = filtroBusca === '' || u.nome.toLowerCase().includes(filtroBusca.toLowerCase());
                          const setorOk = filtroSetor === '' || u.setor === filtroSetor;
                          return buscaOk && setorOk;
                        })
                        .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

                      return (
                        <>
                          <div className="mx-4 my-2 border-t border-slate-100" />
                          <div className="px-4 pb-2">
                            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wide mb-2">Adicionar</p>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Buscar nome..."
                                value={filtroBusca}
                                onChange={(e) => setFiltroBusca(e.target.value)}
                                className="flex-1 text-[11px] px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-orange-300 transition-colors"
                              />
                              {setoresUnicos.length > 0 && (
                                <select
                                  value={filtroSetor}
                                  onChange={(e) => setFiltroSetor(e.target.value)}
                                  className="text-[11px] px-2 py-1.5 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-orange-300 transition-colors max-w-[110px]"
                                >
                                  <option value="">Setor</option>
                                  {setoresUnicos.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                  ))}
                                </select>
                              )}
                            </div>
                          </div>
                          <div className="max-h-44 overflow-y-auto pb-2">
                            {usuariosFiltrados.length === 0 ? (
                              <p className="text-center text-[12px] text-slate-400 py-4">Nenhum usuário encontrado.</p>
                            ) : (
                              usuariosFiltrados.map((u) => (
                                <button
                                  key={u.id}
                                  onClick={() => adicionarParticipante(u.id)}
                                  disabled={adicionandoId === u.id}
                                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-orange-50 transition-colors text-left disabled:opacity-60"
                                >
                                  <UserAvatar nome={u.nome} size="md" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[12px] font-semibold text-slate-700 truncate">{u.nome}</p>
                                    <p className="text-[10px] text-slate-400 truncate">{u.setor || u.email}</p>
                                  </div>
                                  {adicionandoId === u.id
                                    ? <span className="text-[10px] text-slate-400 shrink-0">Adicionando...</span>
                                    : <span className="text-[10px] font-bold shrink-0" style={{ color: LARANJA }}>+ Convidar</span>
                                  }
                                </button>
                              ))
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </>
                )}
              </div>
            )}
          </div>

          <p className="text-sm text-slate-600 mt-3">{selectedTicket.descricao}</p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 bg-slate-50">
          {carregandoMensagens
            ? <div className="text-center text-sm text-slate-400 py-8">Carregando...</div>
            : mensagens.length === 0
              ? <div className="text-center text-sm text-slate-400 py-8">Nenhuma mensagem.</div>
              : mensagens.map((msg: any) => {
                  const ehMinha = usuarioLogado
                    ? (msg.autorEmail === usuarioLogado.email || msg.autor === usuarioLogado.nome)
                    : false;
                  return (
                    <div key={msg.id} className={`flex ${ehMinha ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] flex flex-col ${ehMinha ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`rounded-xl px-4 py-2.5 text-sm ${ehMinha ? 'text-white' : 'bg-white border border-slate-200 text-slate-700'}`}
                          style={ehMinha ? { backgroundColor: LARANJA } : undefined}
                        >
                          {msg.texto && <p className="whitespace-pre-wrap">{msg.texto}</p>}
                        </div>
                        <span className="text-[11px] text-slate-400 mt-1 px-1">{msg.autor} · {formatarHora(msg.enviadoEm)}</span>
                      </div>
                    </div>
                  );
                })
          }
        </div>

        <div className="p-4 bg-white border-t border-slate-100 rounded-b-xl relative group">
          {isFinalizado && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/10 cursor-not-allowed" title="Reabra o chamado para enviar mensagens." />
          )}
          <div className={`border border-slate-200 rounded-2xl bg-white px-4 py-3 ${isFinalizado ? 'bg-slate-100' : ''}`}>
            {anexos.length > 0 && (
              <ul className="flex flex-wrap gap-2 mb-2">
                {anexos.map((anexo) => (
                  <li key={anexo.nome} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                    <FileText size={13} className="text-slate-400" />
                    <span className="text-slate-600 truncate">{anexo.nome}</span>
                    <button type="button" onClick={() => removerAnexo(anexo.nome)} className="text-slate-400 hover:text-red-500"><X size={13} /></button>
                  </li>
                ))}
              </ul>
            )}
            {erroInput && <div className="text-xs text-red-600 mb-2">{erroInput}</div>}
            <div className="flex items-end gap-2">
              <button type="button" onClick={() => inputArquivoRef.current?.click()} disabled={disabled || isFinalizado} className="shrink-0 p-2.5 rounded-full text-slate-400 hover:text-[rgb(233,92,19)] disabled:opacity-50" title="Anexar">
                <Paperclip size={19} />
              </button>
              <textarea
                ref={textareaRef}
                value={texto}
                onChange={(e) => atualizarTexto(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isFinalizado ? 'Chamado finalizado' : 'Escreva uma mensagem...'}
                disabled={disabled || isFinalizado}
                rows={1}
                className="flex-1 resize-none px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 outline-none disabled:bg-slate-100 transition-colors h-10 max-h-40 overflow-y-auto"
              />
              <button type="button" onClick={enviar} disabled={!podeEnviar} className="shrink-0 p-2.5 rounded-full text-white transition-opacity disabled:opacity-40" style={{ backgroundColor: isFinalizado ? '#A0A0A0' : LARANJA }}>
                <Send size={18} />
              </button>
            </div>
          </div>
          <input ref={inputArquivoRef} type="file" multiple className="hidden" onChange={(e) => adicionarArquivos(e.target.files)} />
        </div>

      </div>
    </div>
  );
}