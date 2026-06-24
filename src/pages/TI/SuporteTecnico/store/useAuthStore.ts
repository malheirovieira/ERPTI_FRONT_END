// src/store/useAuthStore.ts
import { create } from 'zustand';
import { API_URL, getAuthHeaders } from '../../../../services/api';

export type Role = 'USER' | 'TECNICO' | 'ADMIN';

export interface UsuarioLogado {
    id: number;
    nome: string;
    email: string;
    role: Role;
    cargo?: string;
    empresaAcesso?: string;
    ativo?: boolean;
}

interface AuthStoreState {
    usuario: UsuarioLogado | null;
    loading: boolean;
    fetchUsuarioLogado: () => Promise<void>;
    isAdmin: () => boolean;
    isBloqueadoSuporte: () => boolean;
}

export const useAuthStore = create<AuthStoreState>((set, get) => ({
    usuario: null,
    loading: false,

    fetchUsuarioLogado: async () => {
        set({ loading: true });
        try {
            const response = await fetch(`${API_URL}/usuarios/me`, {
                method: 'GET',
                headers: getAuthHeaders(),
            });

            if (response.ok) {
                const dados = await response.json();
                set({ usuario: dados });
            } else {
                set({ usuario: null });
            }
        } catch (error) {
            console.error('Erro ao buscar usuário logado:', error);
            set({ usuario: null });
        } finally {
            set({ loading: false });
        }
    },

    isAdmin: () => get().usuario?.role === 'ADMIN',

    // ADMIN nunca é bloqueado, mesmo se ativo === false.
    // USER e TECNICO são bloqueados do Suporte Técnico quando ativo === false.
    isBloqueadoSuporte: () => {
        const usuario = get().usuario;
        if (!usuario) return false;
        if (usuario.role === 'ADMIN') return false;
        return usuario.ativo === false;
    },
}));