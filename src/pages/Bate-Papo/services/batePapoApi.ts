import { ENDPOINTS } from '../config/api.config';
import type { MensagemRetornoDTO } from '../types/batePapo.types';

// TODO: troque por como seu projeto já busca o token (AuthContext, localStorage, cookie httpOnly...)
function obterToken(): string | null {
  return localStorage.getItem('token');
}

/** GET /api/batepapo/historico/{canalId} */
export async function buscarHistoricoCanal(canalId: number): Promise<MensagemRetornoDTO[]> {
  const token = obterToken();

  const resposta = await fetch(ENDPOINTS.historicoCanal(canalId), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!resposta.ok) {
    throw new Error(`Falha ao buscar histórico do canal ${canalId}: ${resposta.status}`);
  }

  return resposta.json();
}
