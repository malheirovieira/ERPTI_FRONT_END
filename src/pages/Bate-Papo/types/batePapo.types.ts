export interface RemetenteDTO {
  id: number;
  nome: string;
  email: string;
  fotoPerfil: string | null;
}

export interface MensagemRetornoDTO {
  id: number;
  canalId: number;
  conteudo: string;
  enviadoEm: string;
  remetente: RemetenteDTO;
}

export interface EnviarMensagemPayload {
  canalId: number;
  remetenteId: number;
  conteudo: string;
}

// ===== NOVO: Fase 1 - tempo real avançado =====

export interface PresencaEvento {
  usuarioId: number;
  online: boolean;
}

export interface DigitandoEvento {
  canalId: number;
  usuarioId: number;
  usuarioNome: string;
  digitando: boolean;
}