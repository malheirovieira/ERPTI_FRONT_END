import { API_URL, getAuthHeaders } from "../../../services/api";
import type { AvisoResponse, AvisoRequest } from '../types/post';

export const postService = {
  listarFeed: async (): Promise<AvisoResponse[]> => {
    const response = await fetch(`${API_URL}/avisos`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Erro ao carregar o feed de avisos.');
    }

    return response.json();
  },

  criarAviso: async (data: AvisoRequest): Promise<AvisoResponse> => {
    const response = await fetch(`${API_URL}/avisos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const textoErro = await response.text();
      throw new Error(textoErro || 'Erro ao criar aviso.');
    }

    return response.json();
  },

  excluirAviso: async (idAviso: number): Promise<void> => {
    const response = await fetch(`${API_URL}/avisos/${idAviso}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const textoErro = await response.text();
      throw new Error(textoErro || 'Erro ao excluir aviso.');
    }
  }
};