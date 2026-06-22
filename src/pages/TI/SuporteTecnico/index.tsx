import { useState } from 'react'; // Importado useState para gerenciar o clique dos cards
import DashboardCards from './components/DashboardCards';
import TicketFilters from './components/TicketFilters';
import TicketModal from './components/TicketModal';
import { useTicketStore } from '../../../store/useTicketStore';
import type { Ticket } from './types/ticket';

export default function SuporteTecnico() {
    const setSelectedTicket = useTicketStore(
        (state) => state.setSelectedTicket
    );

    // Estado responsável por armazenar o filtro ativo vindo dos DashboardCards
    const [filtroStatus, setFiltroStatus] = useState<string | null>(null);

    // Mock de dados para exibição inicial dos chamados
    const tickets: Ticket[] = [
        {
            id: 1,
            titulo: 'Falha no Servidor Principal',
            categoria: 'Infraestrutura',
            prioridade: 'Crítica',
            cliente: 'Empresa A',
            usuario: 'João Silva',
            descricao: 'Servidor principal indisponível desde às 08:00.',
            status: 'Aberto',
            responsavel: 'Gabriel'
        },
        {
            id: 2,
            titulo: 'Sem acesso à internet',
            categoria: 'Rede',
            prioridade: 'Alta',
            cliente: 'Empresa B',
            usuario: 'João Silva',
            descricao: 'Usuários do setor administrativo sem acesso.',
            status: 'Em andamento',
            responsavel: 'Carlos'
        },
        {
            id: 3,
            titulo: 'Erro no ERP',
            categoria: 'Sistemas',
            prioridade: 'Média',
            cliente: 'Empresa C',
            usuario: 'João Silva',
            descricao: 'Erro ao gerar pedidos no ERP.',
            status: 'Aguardando cliente'
        },
        {
            id: 4,
            titulo: 'Instalação de impressora',
            categoria: 'Suporte',
            prioridade: 'Baixa',
            cliente: 'Empresa D',
            usuario: 'João Silva',
            descricao: 'Solicitação de instalação de impressora.',
            status: 'Resolvido',
            responsavel: 'João'
        }
    ];

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

    // Filtra a lista de exibição com base no card ativo no Dashboard
    const ticketsFiltrados = tickets.filter(ticket => {
        if (!filtroStatus) return true; // Se nenhum card estiver selecionado, exibe todos
        if (filtroStatus === 'Resolvido') {
            return ticket.status === 'Resolvido' || ticket.status === 'Fechado';
        }
        return ticket.status === filtroStatus;
    });

    return (
        <div className="p-6 space-y-6">
            {/* Passando os estados e a lista de tickets para sincronismo dinâmico com os cards */}
            <DashboardCards 
                tickets={tickets} 
                selectedStatus={filtroStatus} 
                onSelectStatus={setFiltroStatus} 
            />
            
            <TicketFilters />

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
            </div>

            <TicketModal />
        </div>
    );
}