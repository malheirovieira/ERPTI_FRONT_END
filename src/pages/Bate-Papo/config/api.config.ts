// Centraliza as URLs do back-end de comunicação interna.
// Ajuste VITE_API_BASE_URL no seu .env, ex: VITE_API_BASE_URL=http://localhost:8080
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

export const ENDPOINTS = {
  /** Endpoint de conexão WebSocket (STOMP over SockJS) */
  wsConexao: `${API_BASE_URL}/ws-gestao`,

  /** Destino STOMP para publicar uma nova mensagem */
  wsEnviarMensagem: '/app/batepapo/enviar',

  /** Tópico STOMP para se inscrever e receber mensagens em tempo real de um canal */
  wsTopicoCanal: (canalId: number) => `/topic/canal/${canalId}`,

  /** Rota REST para buscar o histórico salvo de um canal */
  historicoCanal: (canalId: number) => `${API_BASE_URL}/api/batepapo/historico/${canalId}`,
};
