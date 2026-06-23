// src/pages/TI/SuporteTecnico/types/ticket.ts

export type TicketStatus = 'Aberto' | 'Em andamento' | 'Aguardando cliente' | 'Resolvido' | 'Fechado';

export type TicketPrioridade = 'Baixa' | 'Média' | 'Alta' | 'Crítica';

export interface TicketAnexo {
  nome: string;
  tamanho: number; // em bytes
  tipo: string; // mime type
  /** Por enquanto guardamos o arquivo em memória (File). Quando o back-end estiver pronto, troque por uma URL após o upload. */
  arquivo?: File;
  url?: string;
}

export interface Ticket {
  id: number;
  titulo: string;
  categoria: string;
  prioridade: TicketPrioridade;
  cliente: string; // Mantido por compatibilidade
  usuario: string; // Mantido por compatibilidade
  descricao: string;
  status: TicketStatus;
  responsavel?: string;
  /** Data de criação do chamado, formato ISO (ex: '2026-06-22'). Opcional até o back-end enviar esse campo. */
  dataCriacao?: string;
  anexos?: TicketAnexo[];

  // ─── NOVOS CAMPOS VINDOS DA API DO BACK-END ──────────────────────────────
  empresa?: string;
  usuarioAbriu?: {
    id: number;
    nome: string;
    email: string;
    role?: string;
  };
  // ─────────────────────────────────────────────────────────────────────────
}

/** Dados preenchidos pelo cliente ao abrir um novo chamado. */
export interface NovoChamadoInput {
  titulo: string;
  categoria: string;
  prioridade: TicketPrioridade;
  cliente: string;
  usuario: string;
  descricao: string;
  anexos: TicketAnexo[];
}

/** Dados enviados pelo TicketChatInput ao mandar uma mensagem dentro de um chamado. */
export interface TicketChatMensagemInput {
  texto: string;
  anexos: TicketAnexo[];
}

/** Mensagem já registrada no histórico de conversa do chamado. */
export interface TicketChatMensagem extends TicketChatMensagemInput {
  id: string;
  autor: string;
  /** Indica se quem enviou foi o cliente ou o técnico — usado para alinhar a bolha do chat. */
  autorTipo: 'cliente' | 'tecnico';
  enviadoEm: string; // ISO datetime
}