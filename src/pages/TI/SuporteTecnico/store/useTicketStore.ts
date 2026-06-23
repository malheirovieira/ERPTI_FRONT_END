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
}

//  FUNÇÃO DE FORMATAÇÃO VISUAL DOS NOMES (Empresas / Usuários)
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
            
            //  Aplica a formatação embelezedora aqui
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
}));