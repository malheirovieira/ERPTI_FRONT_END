import { useState } from 'react'; // Importado useState para gerenciar o clique dos cards
import { Plus } from 'lucide-react';
import DashboardCards from './components/DashboardCards';
import TicketFilters from './components/TicketFilters';
import TicketModal from './components/TicketModal';
import NovoChamadoModal from './components/NovoChamadoModal';
import { useTicketStore } from './store/useTicketStore';
import type { NovoChamadoInput, Ticket } from './types/ticket';

export default function SuporteTecnico() {
    const setSelectedTicket = useTicketStore(
        (state) => state.setSelectedTicket
    );

    // Estado responsável por armazenar o filtro ativo vindo dos DashboardCards
    const [filtroStatus, setFiltroStatus] = useState<string | null>(null);

    // Lista de tickets já filtrada pelo TicketFilters (busca, categoria, prioridade, cliente, data)
    const [ticketsFiltradosPorBusca, setTicketsFiltradosPorBusca] = useState<Ticket[] | null>(null);

    // Controle do modal de abertura de novo chamado
    const [modalNovoChamadoAberto, setModalNovoChamadoAberto] = useState(false);

    // Nome do usuário autenticado. Por enquanto fixo aqui — quando o back-end
    // (Bearer Token) estiver integrado, troque por dados reais vindos do hook
    // de autenticação (ex: const { user } = useAuth(); usuarioLogado={user.nome}).
    const usuarioLogado = 'João Silva';

    // Lista de chamados. Vazia por padrão — alimente via API (ex: useEffect + fetch/service)
    // assim que o back-end estiver disponível.
    const [tickets, setTickets] = useState<Ticket[]>([]);

    // Configuração de cores para níveis de prioridade
    const prioridadeConfig: Record<string, string> = {
        'Crítica': 'bg-red-600',
        'Alta': 'bg-orange-600',
        'Média': 'bg-yellow-500',
        'Baixa': 'bg-green-600',
    };

    // Paleta de cores customizada para os estados de fluxo do chamado
    const statusConfig: Record<string, string> = {
        'Aberto': '#FAA72A',
        'Em andamento': '#FBBD49',
        'Aguardando cliente': '#DFF368',
        'Resolvido': '#FAA72A',
        'Fechado': '#FBBD49',
    };

    // Base já filtrada pelo TicketFilters (ou a lista completa, se nenhum filtro de busca foi aplicado ainda)
    const baseTickets = ticketsFiltradosPorBusca ?? tickets;

    // Filtra a lista de exibição com base no card ativo no Dashboard, em cima do resultado do TicketFilters
    const ticketsFiltrados = baseTickets.filter(ticket => {
        if (!filtroStatus) return true; // Se nenhum card estiver selecionado, exibe todos
        if (filtroStatus === 'Resolvido') {
            return ticket.status === 'Resolvido' || ticket.status === 'Fechado';
        }
        return ticket.status === filtroStatus;
    });

    // Cria o chamado localmente. Quando o back-end estiver pronto, troque o corpo desta
    // função por uma chamada à API (enviando inclusive os anexos via FormData) e só
    // atualize o estado local após a resposta de sucesso.
    function handleCriarChamado(dados: NovoChamadoInput) {
        const novoTicket: Ticket = {
            id: Math.max(0, ...tickets.map((t) => t.id)) + 1,
            titulo: dados.titulo,
            categoria: dados.categoria,
            prioridade: dados.prioridade,
            cliente: dados.cliente,
            usuario: dados.usuario,
            descricao: dados.descricao,
            status: 'Aberto',
            dataCriacao: new Date().toISOString().slice(0, 10),
            anexos: dados.anexos,
        };

        setTickets((atual) => [novoTicket, ...atual]);
        setModalNovoChamadoAberto(false);
    }

    return (
        <div className="p-6 space-y-6">
            {/* Cabeçalho com ação principal de abertura de chamado */}
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-slate-800">Suporte Técnico</h1>
                <button
                    onClick={() => setModalNovoChamadoAberto(true)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors hover:opacity-90"
                    style={{ backgroundColor: 'rgb(233, 92, 19)' }}
                >
                    <Plus size={17} />
                    Abrir chamado
                </button>
            </div>

            {/* Passando os estados e a lista de tickets para sincronismo dinâmico com os cards */}
            <DashboardCards 
                tickets={tickets} 
                selectedStatus={filtroStatus} 
                onSelectStatus={setFiltroStatus} 
            />
            
            <TicketFilters
                tickets={tickets}
                onFilterChange={(_, filtrados) => setTicketsFiltradosPorBusca(filtrados)}
            />

            {/* O container mantém a KEY para resetar a lista inteira do zero a cada clique,
                mas a animação agora acontece individualmente em cada item abaixo. */}
            <div key={filtroStatus || 'todos'} className="space-y-6">
                
                {/* Injeção global dos Keyframes para a aparição individual de cada chamado */}
                <style dangerouslySetInnerHTML={{__html: `
                    @keyframes fadeInItem {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}} />

                {/* Renderização da lista utilizando a constante filtrada com capturador de index */}
                {ticketsFiltrados.map((ticket, index) => {
                    const bgPrioridade = prioridadeConfig[ticket.prioridade] || 'bg-slate-500';
                    const statusColor = statusConfig[ticket.status] || '#DFF368';
                    
                    return (
                        <div
                            key={ticket.id}
                            onClick={() => setSelectedTicket(ticket)}
                            className="group bg-white border border-slate-200 rounded-xl p-5 cursor-pointer transition-all duration-800 ease-in-out overflow-hidden max-h-[120px] hover:max-h-[300px] hover:shadow-lg opacity-0 animate-[fadeInItem_1s_cubic-bezier(0.25,1,0.5,1)_forwards]"
                            style={{ animationDelay: `${index * 200}ms` }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgb(233, 92, 19)'}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgb(226, 232, 240)'}
                        >
                            <div className="flex justify-between items-start gap-4">
                                <h3 className="font-bold text-slate-800 text-[17px]">{ticket.titulo}</h3>
                                <span className={`px-3 py-1 rounded-md text-[11px] font-bold uppercase text-white ${bgPrioridade}`}>
                                    {ticket.prioridade}
                                </span>
                            </div>

                            <div className="flex gap-2 my-3">
                                <span className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-md text-white" style={{ backgroundColor: 'rgb(233, 92, 19)' }}>
                                    {ticket.categoria}
                                </span>
                                <span className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-md text-slate-800" style={{ backgroundColor: statusColor }}>
                                    {ticket.status}
                                </span>
                            </div>

                            {/* Exibição dos dados do cliente e solicitante */}
                            <div className="flex justify-between text-[13px] text-slate-400">
                                <span>Cliente: {ticket.cliente} | Usuário: {ticket.usuario}</span>
                                <span>22/06/2026</span>
                            </div>

                            {/* Conteúdo oculto revelado na expansão do card */}
                            <div className="mt-4 pt-4 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                <p className="text-[13px] text-slate-600 mb-4">{ticket.descricao}</p>
                                <div className="text-[12px] text-slate-400">
                                    <p className="mb-2 font-semibold text-slate-700">Responsável: {ticket.responsavel || 'Não atribuído'}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {ticketsFiltrados.length === 0 && tickets.length > 0 && (
                    <div className="text-center py-12 text-slate-400 text-sm">
                        Nenhum chamado encontrado com esses filtros.
                    </div>
                )}

                {tickets.length === 0 && (
                    <div className="text-center py-12 text-slate-400 text-sm">
                        Nenhum chamado aberto ainda. Clique em "Abrir chamado" para criar o primeiro.
                    </div>
                )}
            </div>

            <TicketModal />

            <NovoChamadoModal
                aberto={modalNovoChamadoAberto}
                onClose={() => setModalNovoChamadoAberto(false)}
                onSubmit={handleCriarChamado}
                usuarioLogado={usuarioLogado}
            />
        </div>
    );
}
