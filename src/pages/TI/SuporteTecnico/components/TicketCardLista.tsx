import { formatarStatus } from '../utils/ticketUtils';
import type { Ticket } from '../types/ticket';
import { Clock, User } from 'lucide-react';

interface Props {
  ticket: Ticket;
  onClick?: () => void;
}

// Configuração estética das badges de prioridade
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
  // Captura os valores já mapeados com segurança pela Store
  const prioridadeExibida = ticket.prioridade || 'N/A';
  const clienteExibido = ticket.cliente || 'Não informado';
  const usuarioExibido = ticket.usuario || 'Não informado';

  return (
    <div
      onClick={onClick}
      // h-full e flex flex-col permitem que o rodapé fique alinhado na base
      // pb-6 garante o espaço inferior (respiro)
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

      {/* mt-auto empurra este bloco para o final do card, criando o espaço necessário */}
      <div className="flex items-center justify-between text-xs text-gray-400 mt-auto">
        <div className="flex items-center gap-2">
          <User size={14} />
          <span>
            Empresa: <strong>{clienteExibido}</strong>
            {' | '}
            Usuário: <strong>{usuarioExibido}</strong>
          </span>
        </div>

        <div className="flex items-center gap-1 font-medium text-gray-600">
          <Clock size={14} />
          {/* A função formatarStatus irá corrigir o texto EM_ANDAMENTO */}
          {formatarStatus(ticket.status || 'Pendente')}
        </div>
      </div>
    </div>
  );
}