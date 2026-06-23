import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import DashboardCards from './components/TicketDashboard';
import TicketFilters from './components/TicketFiltro';
import TicketModal from './components/TicketChat';
import NovoChamadoModal from './components/TicketCriacao';
import { useTicketStore } from './store/useTicketStore';
import type { Ticket } from './types/ticket';

export default function SuporteTecnico() {
    // Capturando os estados globais da Store do Zustand
    const { 
        tickets, 
        loading: carregando, 
        fetchTickets, 
        setSelectedTicket 
    } = useTicketStore();

    const [filtroStatus, setFiltroStatus] = useState<string | null>(null);
    const [ticketsFiltradosPorBusca, setTicketsFiltradosPorBusca] = useState<Ticket[] | null>(null);
    const [modalNovoChamadoAberto, setModalNovoChamadoAberto] = useState(false);
    const usuarioLogado = 'João Silva';

    // Configuração de cores originais mapeando todas as variações possíveis da API
    const prioridadeConfig: Record<string, string> = {
        'Crítica': 'bg-red-600',
        'CRÍTICA': 'bg-red-600',
        'CRITICA': 'bg-red-600',
        'Alta': 'bg-orange-600',
        'ALTA': 'bg-orange-600',
        'Média': 'bg-yellow-500',
        'MÉDIA': 'bg-yellow-500',
        'MEDIA': 'bg-yellow-500',
        'Baixa': 'bg-green-600',
        'BAIXA': 'bg-green-600',
    };

    const statusConfig: Record<string, string> = {
        'Aberto': '#FAA72A',
        'ABERTO': '#FAA72A',
        'Em andamento': '#FBBD49',
        'EM_ANDAMENTO': '#FBBD49',
        'Aguardando cliente': '#DFF368',
        'Resolvido': '#FAA72A',
        'RESOLVIDO': '#FAA72A',
        'Fechado': '#FBBD49',
        'FECHADO': '#FBBD49',
    };

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    const baseTickets = ticketsFiltradosPorBusca ?? tickets;

    const ticketsFiltrados = baseTickets.filter(ticket => {
        if (!filtroStatus) return true;
        
        const statusNormalizado = ticket.status?.toUpperCase();
        const filtroNormalizado = filtroStatus.toUpperCase();

        if (filtroNormalizado === 'RESOLVIDO') {
            return statusNormalizado === 'RESOLVIDO' || statusNormalizado === 'FECHADO';
        }
        return statusNormalizado === filtroNormalizado;
    });

    async function handleCriarChamado() {
        await fetchTickets();
        setModalNovoChamadoAberto(false);
    }

    if (carregando) {
        return (
            <div className="flex justify-center items-center h-96">
                <span className="text-slate-500">
                    Carregando chamados do servidor...
                </span>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Cabeçalho */}
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

            <DashboardCards 
                tickets={tickets} 
                selectedStatus={filtroStatus} 
                onSelectStatus={setFiltroStatus} 
            />
            
            <TicketFilters
                tickets={tickets}
                onFilterChange={(_, filtrados) => setTicketsFiltradosPorBusca(filtrados)}
            />

            {/* Container da listagem */}
            <div key={filtroStatus || 'todos'} className="space-y-6">
                
                <style dangerouslySetInnerHTML={{__html: `
                    @keyframes fadeInItem {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}} />

                {ticketsFiltrados.map((ticket, index) => {
                    // Busca a cor correta aceitando tanto 'Baixa' quanto 'BAIXA'
                    const bgPrioridade = prioridadeConfig[ticket.prioridade] || prioridadeConfig[ticket.prioridade?.toUpperCase()] || 'bg-slate-500';
                    const statusColor = statusConfig[ticket.status] || statusConfig[ticket.status?.toUpperCase()] || '#DFF368';
                    
                    return (
                        <div
                            key={ticket.id}
                            onClick={() => setSelectedTicket(ticket)}
                            className="group bg-white border border-slate-200 rounded-xl p-5 cursor-pointer transition-all duration-800 ease-in-out overflow-hidden max-h-[120px] hover:max-h-[300px] hover:shadow-lg opacity-0 animate-[fadeInItem_1s_cubic-bezier(0.25,1,0.5,1)_forwards]"
                            style={{ animationDelay: `${index * 100}ms` }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgb(233, 92, 19)'}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgb(226, 232, 240)'}
                        >
                            <div className="flex justify-between items-start gap-4">
                                {/* 🟢 CORREÇÃO: Removido o ID, exibindo apenas o título original novamente */}
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

                            {/* Alinhamento estético de Empresa e Usuário com nomes já formatados em formato bonito vindo da Store */}
                            <div className="flex justify-between text-[12px] text-slate-400 font-medium">
                                <span>
                                    Empresa: <span className="text-slate-700 font-semibold">{ticket.cliente}</span>
                                    {'  |  '}
                                    Usuário: <span className="text-slate-700 font-semibold">{ticket.usuario}</span>
                                </span>
                                <span className="font-semibold text-slate-400">
                                    {ticket.dataCriacao
                                        ? new Date(ticket.dataCriacao).toLocaleDateString('pt-BR')
                                        : '-'}
                                </span>
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

            {/* Modais da tela */}
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