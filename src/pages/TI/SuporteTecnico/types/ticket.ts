// src/pages/TI/SuporteTecnico/types/ticket.ts

export type TicketStatus = 'Aberto' | 'Em andamento' | 'Aguardando cliente' | 'Resolvido' | 'Fechado';

export type TicketPrioridade = 'Baixa' | 'Média' | 'Alta' | 'Crítica';

export interface Ticket {
  id: number;
  titulo: string;
  categoria: string;
  prioridade: TicketPrioridade;
  cliente: string;
  usuario: string;
  descricao: string;
  status: TicketStatus;
  responsavel?: string;
}