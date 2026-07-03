import axios from 'axios';

const API_URL = 'http://localhost:7000/api';

/**
 * Busca o token do localStorage e monta os cabeçalhos.
 */
const getAuthHeaders = () => {
  // Altere para a chave exata que armazena seu token JWT caso não seja 'token'
  const token = localStorage.getItem('token'); 
  
  console.group('--- Diagnóstico de Requisição HTTP ---');
  if (!token) {
    console.warn('AVISO: Nenhum token foi encontrado no localStorage sob a chave "token".');
  } else {
    console.log('Token encontrado com sucesso. Enviando no cabeçalho Authorization.');
  }
  console.groupEnd();

  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  };
};

/**
 * Busca o histórico de mensagens de um canal específico.
 * Rota corrigida para: /api/bate-papo/canal/{id}/mensagens
 */
export const buscarHistoricoCanal = async (canalId: number) => {
  try {
    const headersConfig = getAuthHeaders();
    const resposta = await axios.get(`${API_URL}/bate-papo/canal/${canalId}/mensagens`, headersConfig);
    return resposta.data;
  } catch (error: any) {
    console.group('--- Erro Detalhado (buscarHistoricoCanal) ---');
    console.error('Status do Erro:', error.response?.status);
    console.error('Dados de resposta do Backend:', error.response?.data);
    console.groupEnd();
    
    throw new Error('Falha ao buscar histórico: ' + (error.response?.status || error.message));
  }
};

/**
 * Busca o mapa de mensagens não lidas agrupadas por canal para o usuário atual.
 * Rota corrigida para: /api/bate-papo/nao-lidas/{id}
 */
export const buscarNaoLidasPorUsuario = async (usuarioId: number) => {
  try {
    const headersConfig = getAuthHeaders();
    const resposta = await axios.get(`${API_URL}/bate-papo/nao-lidas/${usuarioId}`, headersConfig);
    return resposta.data;
  } catch (error: any) {
    throw new Error('Falha ao buscar não lidas: ' + (error.response?.status || error.message));
  }
};