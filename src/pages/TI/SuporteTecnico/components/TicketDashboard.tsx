import { Briefcase, Clock, CheckCircle } from 'lucide-react';
import type { Ticket } from '../types/ticket';

interface DashboardCardsProps {
  tickets: Ticket[];
  selectedStatus: string | null;
  onSelectStatus: (status: string | null) => void;
}

export default function DashboardCards({ tickets, selectedStatus, onSelectStatus }: DashboardCardsProps) {
  
  // Função robusta para contar status, normalizando o texto para evitar erro de Case Sensitive
  const countByStatus = (status: string) => {
    // Normaliza para comparar: 'Aberto', 'Em andamento', 'Resolvido', 'Fechado'
    const normalizedStatus = status.toLowerCase();

    if (normalizedStatus === 'resolvido') {
      return tickets.filter(t => 
        t.status?.toLowerCase() === 'resolvido' || 
        t.status?.toLowerCase() === 'fechado'
      ).length;
    }

    if (normalizedStatus === 'em andamento') {
      return tickets.filter(t => t.status?.toLowerCase() === 'em andamento' || t.status?.toLowerCase() === 'em_andamento').length;
    }

    return tickets.filter(t => t.status?.toLowerCase() === normalizedStatus).length;
  };

  const cards = [
    { 
      id: 'Aberto', 
      title: 'Chamados em Aberto', 
      count: countByStatus('Aberto'), 
      icon: Briefcase, 
      color: 'text-orange-600', 
      bg: 'bg-orange-50' 
    },
    { 
      id: 'Em andamento', 
      title: 'Em Andamento', 
      count: countByStatus('Em andamento'), 
      icon: Clock, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50' 
    },
    { 
      id: 'Resolvido', 
      title: 'Finalizados', 
      count: countByStatus('Resolvido'), 
      icon: CheckCircle, 
      color: 'text-green-600', 
      bg: 'bg-green-50' 
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {cards.map((card) => {
        const isActive = selectedStatus === card.id;

        return (
          <div 
            key={card.id} 
            onClick={() => onSelectStatus(isActive ? null : card.id)}
            className={`p-6 bg-white rounded-xl border cursor-pointer transition-all duration-300 shadow-sm select-none hover:shadow-md ${
              isActive ? 'border-[rgb(233,92,19)] ring-1 ring-[rgb(233,92,19)]' : 'border-gray-200'
            }`}
          >
            <div className={`w-12 h-12 rounded-lg ${card.bg} flex items-center justify-center mb-4`}>
              <card.icon size={24} className={card.color} />
            </div>
            <h3 className="text-gray-500 font-medium text-sm">{card.title}</h3>
            <p className="text-3xl font-bold mt-1 text-gray-800">{card.count}</p>
          </div>
        );
      })}
    </div>
  );
}