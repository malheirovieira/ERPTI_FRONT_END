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
