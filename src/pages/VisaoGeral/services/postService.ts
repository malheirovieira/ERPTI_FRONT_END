// src/pages/VisaoGeral/services/postService.ts

import { API_URL, getAuthHeaders } from '../../../services/api';
import type { AvisoResponse, ComentarioResponse, CriarAvisoPayload } from '../types/post';

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: getAuthHeaders(),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const texto = await res.text();
    throw new Error(`Erro ${res.status}: ${texto}`);
  }

  const texto = await res.text();
  return texto ? JSON.parse(texto) : (undefined as T);
}

export const postService = {
  // ── Avisos ───────────────────────────────────────────────────────────────
  listarFeed: () => req<AvisoResponse[]>('GET', '/avisos'),

  criarAviso: (payload: CriarAvisoPayload) =>
    req<AvisoResponse>('POST', '/avisos', payload),

  editarAviso: (id: number, payload: Partial<CriarAvisoPayload>) =>
    req<AvisoResponse>('PUT', `/avisos/${id}`, payload),

  excluirAviso: (id: number) =>
    req<void>('DELETE', `/avisos/${id}`),

  toggleFixar: (id: number) =>
    req<{ fixado: boolean }>('PATCH', `/avisos/${id}/fixar`),

  // ── Interações ───────────────────────────────────────────────────────────
  toggleCurtir: (id: number) =>
    req<{ totalCurtidas: number; euCurti: boolean }>('POST', `/avisos/${id}/curtir`),

  toggleFavoritar: (id: number) =>
    req<{ euFavoritei: boolean }>('POST', `/avisos/${id}/favoritar`),

  // ── Comentários ──────────────────────────────────────────────────────────
  listarComentarios: (id: number) =>
    req<ComentarioResponse[]>('GET', `/avisos/${id}/comentarios`),

  // idPai opcional: se informado, cria uma resposta ao comentário pai
  criarComentario: (idAviso: number, conteudo: string, idPai?: number) =>
    req<ComentarioResponse>('POST', `/avisos/${idAviso}/comentarios`, {
      conteudo,
      idPai: idPai ?? null,
    }),

  excluirComentario: (idAviso: number, idComentario: number) =>
    req<void>('DELETE', `/avisos/${idAviso}/comentarios/${idComentario}`),

  // ── Uploads ──────────────────────────────────────────────────────────────
  uploadImagem: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('arquivo', file);
    const res = await fetch(`${API_URL}/avisos/upload`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: formData,
    });
    if (!res.ok) throw new Error(`Erro no upload de imagem: ${await res.text()}`);
    const data = await res.json();
    return data.url;
  },

  uploadAnexo: async (file: File): Promise<{ url: string; nomeOriginal: string }> => {
    const formData = new FormData();
    formData.append('arquivo', file);
    const res = await fetch(`${API_URL}/avisos/upload-anexo`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: formData,
    });
    if (!res.ok) throw new Error(`Erro no upload de anexo: ${await res.text()}`);
    return res.json();
  },
};