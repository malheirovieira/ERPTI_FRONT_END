// src/store/useTicketStore.ts

import { create } from 'zustand';
import type { Ticket } from '../types/ticket';
import { API_URL, getAuthHeaders } from '../../../../services/api';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { useAuthStore } from './useAuthStore';

// ─── TIPOS ────────────────────────────────────────────────────────────────────

interface TicketStoreState {
  tickets: Ticket[];
  loading: boolean;
  fetchTickets: () => Promise<void>;

  selectedTicket: Ticket | null;
  setSelectedTicket: (ticket: Ticket | null) => void;
  updateSelectedTicket: (atualizacao: Partial<Ticket>) => void;
  updateTicket: (updatedTicket: any) => void;

  conectarSocket: () => void;
  desconectarSocket: () => void;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const formatarNome = (texto: string | undefined | null): string => {
  if (!texto) return 'Não informado';
  const textoTratado = texto
    .replace(/_/g, ' ')
    .split(' ')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(' ');
  const dicionarioMarcas: Record<string, string> = {
    Engebag: 'EngeBag',
    Iraflex: 'IraFlex',
  };
  return dicionarioMarcas[textoTratado] || textoTratado;
};

function usuarioPodeVerTicket(chamado: any, usuarioId: number, role: string): boolean {
  if (role === 'ADMIN') return true;
  if (role === 'TECNICO') return chamado.tecnicoPrincipal?.id === usuarioId;

  const ehCriador = chamado.usuarioAbriu?.id === usuarioId;
  const ehParticipante =
    Array.isArray(chamado.participantes) &&
    chamado.participantes.some((p: any) => p.id === usuarioId);

  return ehCriador || ehParticipante;
}

// Referência STOMP fora do store para não serializar no estado
let stompGlobal: Stomp.Client | null = null;

// ─── STORE ────────────────────────────────────────────────────────────────────

export const useTicketStore = create<TicketStoreState>((set, get) => ({
  tickets: [],
  loading: false,
  selectedTicket: null,

  // ── Fetch com filtro de visibilidade ────────────────────────────────────────
  fetchTickets: async () => {
    set({ loading: true });
    try {
      const response = await fetch(`${API_URL}/chamados`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const dados = await response.json();
        const { usuario } = useAuthStore.getState();

        const chamadosTratados: Ticket[] = dados
          .filter((chamado: any) => {
            if (!usuario) return false;
            return usuarioPodeVerTicket(chamado, usuario.id, usuario.role);
          })
          .map((chamado: any) => ({
            ...chamado,
            prioridade: chamado.prioridade || chamado.criticidade || 'Baixa',
            status: chamado.status || 'Aberto',
            responsavel:
              chamado.tecnicoPrincipal?.nome || chamado.responsavel || 'Não atribuído',
            cliente: formatarNome(chamado.cliente || chamado.empresa),
            usuario: formatarNome(chamado.usuarioAbriu?.nome || chamado.usuario),
          }));

        set({ tickets: chamadosTratados });
      }
    } catch (error) {
      console.error('Erro ao buscar chamados:', error);
    } finally {
      set({ loading: false });
    }
  },

  // ── Ticket selecionado ───────────────────────────────────────────────────────
  setSelectedTicket: (ticket) => set({ selectedTicket: ticket }),

  updateSelectedTicket: (atualizacao) =>
    set((state) =>
      state.selectedTicket
        ? { selectedTicket: { ...state.selectedTicket, ...atualizacao } }
        : state
    ),

  // ── Atualização pontual de um ticket na lista ────────────────────────────────
  updateTicket: (updatedTicket) =>
    set((state) => {
      const { usuario } = useAuthStore.getState();

      // Se o ticket atualizado não é mais visível para o usuário, remove da lista
      if (usuario && !usuarioPodeVerTicket(updatedTicket, usuario.id, usuario.role)) {
        return { tickets: state.tickets.filter((t) => t.id !== updatedTicket.id) };
      }

      const existe = state.tickets.some((t) => t.id === updatedTicket.id);

      // Ticket novo (não está na lista ainda): adiciona no topo
      if (!existe) {
        const novoTicket: Ticket = {
          ...updatedTicket,
          prioridade: updatedTicket.prioridade || updatedTicket.criticidade || 'Baixa',
          status: updatedTicket.status || 'Aberto',
          responsavel:
            updatedTicket.tecnicoPrincipal?.nome ||
            updatedTicket.responsavel ||
            'Não atribuído',
          cliente: formatarNome(updatedTicket.cliente || updatedTicket.empresa),
          usuario: formatarNome(
            updatedTicket.usuarioAbriu?.nome || updatedTicket.usuario
          ),
        };
        return { tickets: [novoTicket, ...state.tickets] };
      }

      // Ticket existente: atualiza
      return {
        tickets: state.tickets.map((ticket) => {
          if (ticket.id !== updatedTicket.id) return ticket;
          return {
            ...ticket,
            ...updatedTicket,
            cliente: formatarNome(
              updatedTicket.empresa || updatedTicket.cliente || ticket.cliente
            ),
            usuario: formatarNome(
              updatedTicket.usuarioAbriu?.nome ||
                updatedTicket.usuario ||
                ticket.usuario
            ),
            responsavel:
              updatedTicket.tecnicoPrincipal?.nome ||
              updatedTicket.responsavel ||
              ticket.responsavel ||
              'Não atribuído',
          };
        }),
      };
    }),

  // ── WebSocket global ─────────────────────────────────────────────────────────
  conectarSocket: () => {
    const token = localStorage.getItem('token');
    if (!token || stompGlobal?.connected) return;

    const socket = new SockJS(`${API_URL}/ws-gestao`);
    const stomp = Stomp.over(socket);
    stompGlobal = stomp;
    stomp.debug = () => {};

    stomp.connect({ Authorization: `Bearer ${token}` }, () => {
      stomp.subscribe('/topic/chamados', (frame) => {
        const payload = JSON.parse(frame.body);
        if (payload?.id) {
          get().updateTicket(payload);
        } else {
          get().fetchTickets();
        }
      });
    }, (error: any) => {
      console.error('[TicketSocket] Erro na conexão global:', error);
    });
  },

  desconectarSocket: () => {
    stompGlobal?.disconnect(() => {});
    stompGlobal = null;
  },
}));