// src/config/api.ts

// Configuração das URLs de cada serviço
export const API_URL_SUPORTE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:7000';
export const API_URL_CHAT = 'http://localhost:8080'; // URL do backend do chat

/**
 * Função unificada para gerar headers de autenticação.
 * @param isFormData Define se o Content-Type deve ser omitido (para uploads)
 */
export function getAuthHeaders(isFormData: boolean = false): HeadersInit {
  const token = localStorage.getItem('token');
  
  const headers: HeadersInit = {
    'Authorization': `Bearer ${token}`
  };

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
}

/**
 * Função auxiliar genérica para realizar chamadas Fetch.
 * Centraliza o tratamento de erros e a injeção de headers.
 */
export async function apiRequest(url: string, options: RequestInit = {}) {
  const config: RequestInit = {
    ...options,
    headers: {
      ...getAuthHeaders(options.body instanceof FormData),
      ...options.headers,
    },
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Ocorreu um erro na requisição.');
  }

  return response.json();
}

// --- Funções Específicas do Suporte (Legado/Manutenção) ---

export async function uploadAnexoChamado(chamadoId: number, arquivo: File) {
  const formData = new FormData();
  formData.append('arquivo', arquivo);

  return await apiRequest(`${API_URL_SUPORTE}/chamados/${chamadoId}/mensagens`, {
    method: 'POST',
    body: formData,
  });
}

// --- Funções do Chat ---

export async function fetchUsuariosChat() {
  // Chamada para a rota /usuarios/get que você definiu
  return await apiRequest(`${API_URL_CHAT}/usuarios/get`, {
    method: 'GET'
  });
}

export const API_URL = API_URL_SUPORTE;