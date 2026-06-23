// src/store/useTicketStore.ts

import { create } from 'zustand';
import type { Ticket } from '../types/ticket';

interface TicketStoreState {
  /** Chamado atualmente selecionado. null = nenhum modal aberto. */
  selectedTicket: Ticket | null;
  setSelectedTicket: (ticket: Ticket | null) => void;
  /** Atualiza o ticket selecionado (ex: depois de enviar uma mensagem no chat). */
  updateSelectedTicket: (atualizacao: Partial<Ticket>) => void;
}

export const useTicketStore = create<TicketStoreState>((set) => ({
  selectedTicket: null,

  setSelectedTicket: (ticket) => set({ selectedTicket: ticket }),

  updateSelectedTicket: (atualizacao) =>
    set((state) =>
      state.selectedTicket
        ? { selectedTicket: { ...state.selectedTicket, ...atualizacao } }
        : state
    ),
}));