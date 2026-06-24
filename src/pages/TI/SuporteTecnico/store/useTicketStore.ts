// src/store/useTicketStore.ts

import { create } from 'zustand';
import type { Ticket } from '../types/ticket';
import { API_URL, getAuthHeaders } from '../../../../services/api';

interface TicketStoreState {
  tickets: Ticket[];
  loading: boolean;
  fetchTickets: () => Promise<void>;
  selectedTicket: Ticket | null;
  setSelectedTicket: (ticket: Ticket | null) => void;
  updateSelectedTicket: (atualizacao: Partial<Ticket>) => void;
  
  // ADICIONADO: Função para atualizar a lista global do Dashboard sem dar F5
  updateTicket: (updatedTicket: any) => void;
}

// FUNÇÃO DE FORMATAÇÃO VISUAL DOS NOMES (Empresas / Usuários)
const formatarNome = (texto: string | undefined | null): string => {
  if (!texto) return 'Não informado';

  // 1. Remove underscores (_) e capitaliza a primeira letra de cada palavra (ex: bag_cleaner -> Bag Cleaner)
  let textoTratado = texto
    .replace(/_/g, ' ')
    .split(' ')
    .map((palavra) => palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase())
    .join(' ');

  // 2. Dicionário customizado para nomes comerciais específicos (CamelCase)
  const dicionarioMarcas: Record<string, string> = {
    'Engebag': 'EngeBag',
    'Iraflex': 'IraFlex',
  };

  return dicionarioMarcas[textoTratado] || textoTratado;
};

export const useTicketStore = create<TicketStoreState>((set) => ({
  tickets: [],
  loading: false,
  selectedTicket: null,

  fetchTickets: async () => {
    set({ loading: true });
    try {
      const response = await fetch(`${API_URL}/chamados`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const dados = await response.json();

        const chamadosTratados: Ticket[] = dados.map((chamado: any) => {
          // Captura o nome bruto da empresa e do usuário
          const empresaBruta = chamado.cliente || chamado.empresa;
          const usuarioBruto = chamado.usuarioAbriu?.nome || chamado.usuario;

          return {
            ...chamado,
            prioridade: chamado.prioridade || chamado.criticidade || 'Baixa',
            status: chamado.status || 'Aberto',
            responsavel: chamado.tecnicoPrincipal?.nome || chamado.responsavel || 'Não atribuído',
            
            // Aplica a formatação embelezedora aqui
            cliente: formatarNome(empresaBruta),
            usuario: formatarNome(usuarioBruto),
          };
        });

        set({ tickets: chamadosTratados });
      }
    } catch (error) {
      console.error('Erro ao buscar chamados:', error);
    } finally {
      set({ loading: false });
    }
  },

  setSelectedTicket: (ticket) => set({ selectedTicket: ticket }),

  updateSelectedTicket: (atualizacao) =>
    set((state) =>
      state.selectedTicket
        ? { selectedTicket: { ...state.selectedTicket, ...atualizacao } }
        : state
    ),

  // ADICIONADO: Implementação da atualização dinâmica no background
  updateTicket: (updatedTicket) =>
    set((state) => ({
      tickets: state.tickets.map((ticket) => {
        if (ticket.id === updatedTicket.id) {
          // Garante que os dados originais brutos não se percam na atualização
          const empresaBruta = updatedTicket.empresa || updatedTicket.cliente || ticket.cliente;
          const usuarioBruto = updatedTicket.usuarioAbriu?.nome || updatedTicket.usuario || ticket.usuario;
          
          return {
            ...ticket,
            ...updatedTicket,
            // Re-aplica a sua formatação para não bugar o card
            cliente: formatarNome(empresaBruta),
            usuario: formatarNome(usuarioBruto),
            responsavel: updatedTicket.tecnicoPrincipal?.nome || updatedTicket.responsavel || ticket.responsavel || 'Não atribuído'
          };
        }
        return ticket;
      }),
    })),
}));