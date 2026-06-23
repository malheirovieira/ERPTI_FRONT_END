// src/config/api.ts

// Tenta ir buscar a URL ao ficheiro .env (VITE_API_URL). 
// Se o ficheiro não existir, usa o IP da sua rede como fallback seguro.
export const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.2.155:7000';

/**
 * Função utilitária para gerar os cabeçalhos (headers) com o Token de Autenticação.
 * @param isFormData Define se a requisição vai enviar ficheiros (FormData). Se for verdadeiro, omite o Content-Type.
 */
export function getAuthHeaders(isFormData: boolean = false): HeadersInit {
  const token = localStorage.getItem('token');
  
  const headers: HeadersInit = {
    'Authorization': `Bearer ${token}`
  };

  // Se NÃO for envio de ficheiros (FormData), adicionamos o Content-Type padrão para JSON
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
}