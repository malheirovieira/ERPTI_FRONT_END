import { useState, useEffect } from 'react';
import { Plus, Users, FileBarChart } from 'lucide-react';
import { motion } from 'framer-motion';
import DashboardCards from './components/Dashboard';
import TicketFilters from './components/Filtro';
import TicketModal from './components/Chat';
import NovoChamadoModal from './components/Abertura';
import UsuariosModal from './components/Usuarios';
import UsuarioBloqueadoModal from './components/UsuarioBloqueado';
import { useTicketStore } from './store/useTicketStore';
import { useAuthStore } from './store/useAuthStore';
import type { Ticket } from './types/ticket';
import { formatarStatus } from './utils/ticketUtils';

export default function SuporteTecnico() {
    const { tickets, fetchTickets, setSelectedTicket } = useTicketStore();
    const { usuario, fetchUsuarioLogado, isAdmin, isBloqueadoSuporte } = useAuthStore();
    const [filtroStatus, setFiltroStatus] = useState<string | null>(null);
    const [ticketsFiltradosPorBusca, setTicketsFiltradosPorBusca] = useState<Ticket[] | null>(null);
    const [modalNovoChamadoAberto, setModalNovoChamadoAberto] = useState(false);
    const [modalUsuariosAberto, setModalUsuariosAberto] = useState(false);
    const usuarioLogado = usuario?.nome || 'João Silva';

    const prioridadeConfig: Record<string, string> = {
        'Crítica': 'bg-red-600', 'CRÍTICA': 'bg-red-600', 'CRITICA': 'bg-red-600',
        'Alta': 'bg-orange-600', 'ALTA': 'bg-orange-600',
        'Média': 'bg-yellow-500', 'MÉDIA': 'bg-yellow-500', 'MEDIA': 'bg-yellow-500',
        'Baixa': 'bg-green-600', 'BAIXA': 'bg-green-600',
    };

    const statusConfig: Record<string, string> = {
        'Aberto': '#FAA72A', 
        'ABERTO': '#FAA72A',
        
        'EM ANDAMENTO': '#B3EBF2', 
        'EM_ANDAMENTO': '#B3EBF2',
        
        'Finalizado': '#dff368', 
        'FECHADO': '#dff368',
      };

    useEffect(() => {
        fetchTickets();
        fetchUsuarioLogado();
    }, [fetchTickets, fetchUsuarioLogado]);

    const bloqueado = isBloqueadoSuporte();

    // Enquanto o usuário estiver bloqueado, verifica periodicamente se foi
    // reativado pelo administrador, para o modal sumir automaticamente.
    useEffect(() => {
        if (!bloqueado) return;

        const intervalo = setInterval(() => {
            fetchUsuarioLogado();
        }, 10000);

        return () => clearInterval(intervalo);
    }, [bloqueado, fetchUsuarioLogado]);

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
        <div className="relative">
            <div className={`p-6 space-y-6 ${bloqueado ? 'pointer-events-none select-none blur-[1px]' : ''}`} aria-hidden={bloqueado}>
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-slate-800">Suporte Técnico</h1>
                <div className="flex items-center gap-3">
                    {isAdmin() && (
                        <>
                            <button
                                onClick={() => setModalUsuariosAberto(true)}
                                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-all duration-200 ease-out hover:opacity-90 hover:scale-[1.03] hover:shadow-md active:scale-[0.98]"
                                style={{ backgroundColor: 'rgb(243, 152, 109)' }}
                            >
                                <Users size={17} /> Usuários
                            </button>
                            <button
                                onClick={() => {/* navegação para tela de Relatórios */}}
                                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-all duration-200 ease-out hover:opacity-90 hover:scale-[1.03] hover:shadow-md active:scale-[0.98]"
                                style={{ backgroundColor: 'rgb(238, 122, 64)' }}
                            >
                                <FileBarChart size={17} /> Relatórios
                            </button>
                        </>
                    )}
                    <button
                        onClick={() => setModalNovoChamadoAberto(true)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-all duration-200 ease-out hover:opacity-90 hover:scale-[1.03] hover:shadow-md active:scale-[0.98]"
                        style={{ backgroundColor: 'rgb(233, 92, 19)' }}
                    >
                        <Plus size={17} /> Abrir chamado
                    </button>
                </div>
            </div>

            <DashboardCards tickets={tickets} selectedStatus={filtroStatus} onSelectStatus={setFiltroStatus} />
            <TicketFilters tickets={tickets} onFilterChange={(_, filtrados) => setTicketsFiltradosPorBusca(filtrados)} />

            <motion.div 
                key={filtroStatus || 'todos'} 
                className="space-y-6"
                initial="hidden"
                animate="visible"
                variants={{
                    visible: { 
                        transition: { staggerChildren: 0.3 } 
                    }
                }}
            >
                {ticketsFiltrados.map((ticket) => {
                    const bgPrioridade = prioridadeConfig[ticket.prioridade] || prioridadeConfig[ticket.prioridade?.toUpperCase()] || 'bg-slate-500';
                    
                    // Agora o formatarStatus será encontrado porque você fez o import!
                    const statusFormatado = formatarStatus(ticket.status || 'Pendente');
                    
                    // Busca a cor usando o nome amigável (ex: "Finalizado")
                    const statusColor = statusConfig[statusFormatado] || statusConfig[statusFormatado.toUpperCase()] || '#DFF368';
                    
                    return (
                        <motion.div
                            key={ticket.id}
                            variants={{
                                hidden: { opacity: 0 },
                                visible: { opacity: 1 }
                            }}
                            transition={{ duration: 0.8 }}
                            onClick={() => setSelectedTicket(ticket)}
                            className="group bg-white border border-slate-200 rounded-xl p-5 pb-8 cursor-pointer overflow-hidden transition-all duration-800 ease-in-out max-h-32.5 hover:max-h-75 hover:shadow-lg hover:border-orange-500"
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
                                {/* Aqui exibimos o status formatado */}
                                <span className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-md text-slate-800" style={{ backgroundColor: statusColor }}>
                                    {statusFormatado}
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

                            <div className="mt-4 pt-4 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity duration-800 ease-in-out">
                                <p className="text-[13px] text-slate-600 mb-4">{ticket.descricao}</p>
                                <p className="font-semibold text-slate-700 text-[12px]">Responsável: {ticket.responsavel || 'Não atribuído'}</p>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            <TicketModal />
            <UsuariosModal aberto={modalUsuariosAberto} onClose={() => setModalUsuariosAberto(false)} />
            <NovoChamadoModal aberto={modalNovoChamadoAberto} onClose={() => setModalNovoChamadoAberto(false)} onSubmit={() => {fetchTickets(); setModalNovoChamadoAberto(false);}} usuarioLogado={usuarioLogado} />
            </div>

            {bloqueado && <UsuarioBloqueadoModal />}
        </div>
    );
}