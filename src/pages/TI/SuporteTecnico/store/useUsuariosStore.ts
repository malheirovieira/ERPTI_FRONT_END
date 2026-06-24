// src/store/useUsuariosStore.ts
import { create } from 'zustand';
import { API_URL, getAuthHeaders } from '../../../../services/api';

export interface Usuario {
    id: number;
    nome: string;
    email: string;
    role: 'USER' | 'TECNICO' | 'ADMIN';
    cargo?: string;
    empresaAcesso?: string;
    ativo: boolean;
    fotoPerfil?: string | null;
    idDepartamento?: number | null;
    primeiroAcesso?: boolean;
    ultimoLogin?: string | null;
    usuarioRm?: string | null;
    utilizaOmaxprensa?: boolean;
}

interface UsuariosStoreState {
    usuarios: Usuario[];
    loading: boolean;
    erro: string | null;
    fetchUsuarios: () => Promise<void>;
    alterarStatusUsuario: (id: number, ativo: boolean) => Promise<boolean>;
    excluirUsuario: (id: number) => Promise<boolean>;
}

export const useUsuariosStore = create<UsuariosStoreState>((set, get) => ({
    usuarios: [],
    loading: false,
    erro: null,

    fetchUsuarios: async () => {
        set({ loading: true, erro: null });
        try {
            const response = await fetch(`${API_URL}/usuarios`, {
                method: 'GET',
                headers: getAuthHeaders(),
            });

            if (response.ok) {
                const dados = await response.json();
                set({ usuarios: dados });
            } else {
                set({ erro: 'Não foi possível carregar os usuários.' });
            }
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
            set({ erro: 'Erro de conexão ao buscar usuários.' });
        } finally {
            set({ loading: false });
        }
    },

    alterarStatusUsuario: async (id, ativo) => {
        try {
            const response = await fetch(`${API_URL}/usuarios/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ ativo }),
            });

            if (response.ok) {
                set({
                    usuarios: get().usuarios.map((u) =>
                        u.id === id ? { ...u, ativo } : u
                    ),
                });
                return true;
            }
            return false;
        } catch (error) {
            console.error('Erro ao alterar status do usuário:', error);
            return false;
        }
    },

    excluirUsuario: async (id) => {
        try {
            const response = await fetch(`${API_URL}/usuarios/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });

            if (response.ok) {
                set({
                    usuarios: get().usuarios.filter((u) => u.id !== id),
                });
                return true;
            }
            return false;
        } catch (error) {
            console.error('Erro ao excluir usuário:', error);
            return false;
        }
    },
}));
