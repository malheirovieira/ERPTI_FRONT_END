import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import DashboardCards from './components/TicketDashboard';
import TicketFilters from './components/TicketFiltro';
import TicketModal from './components/TicketChat';
import NovoChamadoModal from './components/TicketCriacao';
import { useTicketStore } from './store/useTicketStore';
import type { Ticket } from './types/ticket';

export default function SuporteTecnico() {
    const { tickets, loading: carregando, fetchTickets, setSelectedTicket } = useTicketStore();
    const [filtroStatus, setFiltroStatus] = useState<string | null>(null);
    const [ticketsFiltradosPorBusca, setTicketsFiltradosPorBusca] = useState<Ticket[] | null>(null);
    const [modalNovoChamadoAberto, setModalNovoChamadoAberto] = useState(false);
    const usuarioLogado = 'João Silva';

    const prioridadeConfig: Record<string, string> = {
        'Crítica': 'bg-red-600', 'CRÍTICA': 'bg-red-600', 'CRITICA': 'bg-red-600',
        'Alta': 'bg-orange-600', 'ALTA': 'bg-orange-600',
        'Média': 'bg-yellow-500', 'MÉDIA': 'bg-yellow-500', 'MEDIA': 'bg-yellow-500',
        'Baixa': 'bg-green-600', 'BAIXA': 'bg-green-600',
    };

    const statusConfig: Record<string, string> = {
        'Aberto': '#FAA72A', 'ABERTO': '#FAA72A',
        'Em andamento': '#FBBD49', 'EM_ANDAMENTO': '#FBBD49',
        'Aguardando cliente': '#DFF368',
        'Resolvido': '#FAA72A', 'RESOLVIDO': '#FAA72A',
        'Fechado': '#FBBD49', 'FECHADO': '#FECHADO',
    };

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    const baseTickets = ticketsFiltradosPorBusca ?? tickets;

    const ticketsFiltrados = baseTickets.filter(ticket => {
        if (!filtroStatus) return true;
        const statusNormalizado = ticket.status?.replace(/_/g, ' ').toLowerCase() || '';
        const filtroNormalizado = filtroStatus.replace(/_/g, ' ').toLowerCase();

        if (filtroNormalizado.includes('finalizados') || filtroNormalizado === 'resolvido') {
            return statusNormalizado === 'resolvido' || statusNormalizado === 'fechado';
        }
        if (filtroNormalizado.includes('andamento')) {
            return statusNormalizado.includes('andamento');
        }
        return statusNormalizado === filtroNormalizado;
    });

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-slate-800">Suporte Técnico</h1>
                <button
                    onClick={() => setModalNovoChamadoAberto(true)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors hover:opacity-90"
                    style={{ backgroundColor: 'rgb(233, 92, 19)' }}
                >
                    <Plus size={17} /> Abrir chamado
                </button>
            </div>

            <DashboardCards tickets={tickets} selectedStatus={filtroStatus} onSelectStatus={setFiltroStatus} />
            <TicketFilters tickets={tickets} onFilterChange={(_, filtrados) => setTicketsFiltradosPorBusca(filtrados)} />

            <div key={filtroStatus || 'todos'} className="space-y-6">
                {ticketsFiltrados.map((ticket, index) => {
                    const bgPrioridade = prioridadeConfig[ticket.prioridade] || prioridadeConfig[ticket.prioridade?.toUpperCase()] || 'bg-slate-500';
                    const statusColor = statusConfig[ticket.status] || statusConfig[ticket.status?.toUpperCase()] || '#DFF368';
                    
                    return (
                        <div
                            key={ticket.id}
                            onClick={() => setSelectedTicket(ticket)}
                            /* 1. 'p-5 pb-8': Padding constante (espaço interno sempre presente)
                               2. 'transition-all duration-500 ease-in-out': Restaura a suavidade no hover
                               3. 'hover:border-orange-500': Restaura o efeito de contorno suave
                            */
                            className="group bg-white border border-slate-200 rounded-xl p-5 pb-8 cursor-pointer transition-all duration-630 ease-in-out overflow-hidden max-h-[130px] hover:max-h-[300px] hover:shadow-lg hover:border-orange-500"
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

                            <div className="flex justify-between text-[12px] text-slate-400 font-medium">
                                <span>
                                    Empresa: <span className="text-slate-700 font-semibold">{ticket.cliente}</span>
                                    {' | '}
                                    Usuário: <span className="text-slate-700 font-semibold">{ticket.usuario}</span>
                                </span>
                                <span>{ticket.dataCriacao ? new Date(ticket.dataCriacao).toLocaleDateString('pt-BR') : '-'}</span>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                <p className="text-[13px] text-slate-600 mb-4">{ticket.descricao}</p>
                                <p className="font-semibold text-slate-700 text-[12px]">Responsável: {ticket.responsavel || 'Não atribuído'}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
            {/* Restante dos modais... */}
            <TicketModal />
            <NovoChamadoModal aberto={modalNovoChamadoAberto} onClose={() => setModalNovoChamadoAberto(false)} onSubmit={() => {fetchTickets(); setModalNovoChamadoAberto(false);}} usuarioLogado={usuarioLogado} />
        </div>
    );
}