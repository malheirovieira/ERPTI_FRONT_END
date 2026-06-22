import { Briefcase, Clock, CheckCircle } from 'lucide-react';
import type { Ticket } from '../types/ticket'; // Certifique-se de manter o caminho correto do seu arquivo de types

// Interface definindo as propriedades necessárias para o sincronismo com o index
interface DashboardCardsProps {
  tickets: Ticket[]; // Lista de tickets para cálculo dos contadores dinâmicos
  selectedStatus: string | null; // Status que está selecionado no momento
  onSelectStatus: (status: string | null) => void; // Função de callback para alterar o filtro
}

export default function DashboardCards({ tickets, selectedStatus, onSelectStatus }: DashboardCardsProps) {
  
  // Função responsável por calcular a quantidade de chamados em tempo real por status
  const countByStatus = (status: string) => {
    if (status === 'Resolvido') {
      // Para o card de finalizados, soma os status 'Resolvido' e 'Fechado'
      return tickets.filter(t => t.status === 'Resolvido' || t.status === 'Fechado').length;
    }
    return tickets.filter(t => t.status === status).length;
  };

  // Configuração estrutural dos cards mapeando com os dados dinâmicos do sistema
  const cards = [
    { id: 'Aberto', title: 'Chamados em Aberto', count: countByStatus('Aberto'), icon: Briefcase, color: 'text-orange-600', bg: 'bg-orange-50' },
    { id: 'Em andamento', title: 'Em Andamento', count: countByStatus('Em andamento'), icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'Resolvido', title: 'Finalizados', count: countByStatus('Resolvido'), icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {cards.map((card) => {
        // Validação se este card específico está ativo no filtro global
        const isActive = selectedStatus === card.id;

        return (
          <div 
            key={card.id} 
            onClick={() => onSelectStatus(isActive ? null : card.id)}
            /* Ajuste de Fluidez e Contorno:
              - Utiliza estritamente a mesma base visual do filtro (border-gray-200 e rounded-xl).
              - Quando ativo (isActive), substitui dinamicamente apenas a cor da borda, 
                mantendo a espessura original de 1px para evitar um aspecto pesado ou travado.
            */
            className={`p-6 bg-white rounded-xl border cursor-pointer transition-all duration-300 shadow-sm select-none hover:shadow-md ${
              isActive ? 'border-[rgb(233,92,19)]' : 'border-gray-200'
            }`}
          >
            <div className={`w-12 h-12 rounded-lg ${card.bg} flex items-center justify-center mb-4`}>
              <card.icon size={24} className={card.color} />
            </div>
            <h3 className="text-gray-500 font-medium">{card.title}</h3>
            <p className="text-3xl font-bold mt-1 text-gray-800">{card.count}</p>
          </div>
        );
      })}
    </div>
  );
}