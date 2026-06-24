import { formatarStatus } from '../utils/ticketUtils';
import type { Ticket } from '../types/ticket';
import { Clock, User } from 'lucide-react';

interface Props {
  ticket: Ticket;
  onClick?: () => void;
}

// Mapeamento de cores corrigido com as chaves formatadas
const statusConfig: Record<string, string> = {
  'Aberto': '#FAA72A',
  'Em Andamento': '#294385',
  'Resolvido': '#FAA72A',
  'Finalizado': '#A0A0A0',
};

const prioridadeColors: Record<string, string> = {
  Baixa: 'bg-green-50 text-green-600',
  Média: 'bg-yellow-50 text-yellow-600',
  Alta: 'bg-orange-50 text-orange-600',
  Crítica: 'bg-red-50 text-red-600',
  BAIXA: 'bg-green-50 text-green-600',
  MÉDIA: 'bg-yellow-50 text-yellow-600',
  ALTA: 'bg-orange-50 text-orange-600',
  CRÍTICA: 'bg-red-50 text-red-600',
};

export default function TicketCard({ ticket, onClick }: Props) {
  const prioridadeExibida = ticket.prioridade || 'N/A';
  const clienteExibido = ticket.cliente || 'Não informado';
  const usuarioExibido = ticket.usuario || 'Não informado';
  
  // Obtém o nome formatado (ex: "Finalizado")
  const statusFormatado = formatarStatus(ticket.status || 'Pendente');

  return (
    <div
      onClick={onClick}
      className="p-4 pb-6 h-full flex flex-col border border-gray-200 rounded-lg cursor-pointer hover:shadow-md transition-all bg-white"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-800">
          #{ticket.id} - {ticket.titulo}
        </h3>
        <span className={`text-xs font-medium px-3 py-1 rounded-full ${prioridadeColors[prioridadeExibida] || 'bg-gray-50 text-gray-600'}`}>
          {prioridadeExibida.charAt(0).toUpperCase() + prioridadeExibida.slice(1).toLowerCase()}
        </span>
      </div>

      <p className="text-sm text-gray-500 mb-3 line-clamp-2">
        {ticket.descricao}
      </p>

      <div className="flex items-center justify-between text-xs text-gray-400 mt-auto">
        <div className="flex items-center gap-2">
          <User size={14} />
          <span>
            Empresa: <strong>{clienteExibido}</strong>
            {' | '}
            Usuário: <strong>{usuarioExibido}</strong>
          </span>
        </div>

        {/* Status com a cor aplicada dinamicamente */}
        <div 
          className="flex items-center gap-1 font-medium px-2 py-1 rounded-md text-white"
          style={{ backgroundColor: statusConfig[statusFormatado] || '#A0A0A0' }}
        >
          <Clock size={14} />
          {statusFormatado}
        </div>
      </div>
    </div>
  );
}