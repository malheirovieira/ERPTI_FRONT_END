import { API_BASE_URL, ENDPOINTS } from '../config/api.config';
import type { MensagemRetornoDTO } from '../types/batePapo.types';
import type { PessoaSelecionavel } from '../mocks/pessoasMock'; // Mantém a interface

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
  if (!resposta.ok) throw new Error(`Falha ao buscar histórico: ${resposta.status}`);
  return resposta.json();
}

/** Busca usuários reais no sistema: GET /api/usuarios?busca={termo} */
export async function buscarUsuarios(termo: string): Promise<PessoaSelecionavel[]> {
  const token = obterToken();
  const resposta = await fetch(`${API_BASE_URL}/api/usuarios?busca=${encodeURIComponent(termo)}`, {
    headers: { 
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  if (!resposta.ok) return [];
  return resposta.json();
}

/** GET /api/usuarios — busca todos os usuários ordenados */
export async function buscarTodosUsuarios(): Promise<PessoaSelecionavel[]> {
  const token = obterToken();
  const resposta = await fetch(`${API_BASE_URL}/api/usuarios`, {
    headers: { 
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  if (!resposta.ok) return [];
  const dados: PessoaSelecionavel[] = await resposta.json();
  
  // Ordena alfabeticamente pelo nome
  return dados.sort((a, b) => a.nome.localeCompare(b.nome));
}