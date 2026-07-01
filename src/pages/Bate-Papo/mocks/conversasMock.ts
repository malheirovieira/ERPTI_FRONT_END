// TODO: substituir por uma lista real vinda do back-end
// (ex: GET /api/batepapo/canais — ainda não existe na documentação atual)
export type TipoConversa = 'individual' | 'grupo' | 'global';

export interface Conversa {
  id: number;
  nome: string;
  tipo: TipoConversa;
  preview: string;
  hora: string;
  naoLidas?: number;
  online?: boolean;
  participantes?: number;
}

export const CONVERSAS_MOCK: Conversa[] = [
  { id: 99, nome: 'Chat Global — Engebag', tipo: 'global', preview: 'Canal aberto para toda a empresa', hora: 'agora', participantes: 312 },
  { id: 1, nome: 'Mariana Souza', tipo: 'individual', preview: 'Beleza, já chamo o suporte então', hora: '09:42', naoLidas: 2, online: true },
  { id: 2, nome: 'Carlos Eduardo', tipo: 'individual', preview: 'Valeu, era isso mesmo!', hora: '08:15', online: true },
  { id: 3, nome: 'Fernanda Lima', tipo: 'individual', preview: 'Te mando o print em instantes', hora: 'Ontem', online: false },
  { id: 10, nome: 'Equipe TI', tipo: 'grupo', preview: 'João: Subi a correção em produção', hora: '10:05', naoLidas: 5, participantes: 4 },
  { id: 11, nome: 'Suporte Técnico — Filial Centro', tipo: 'grupo', preview: 'Você: Resolvido, pode fechar', hora: 'Ontem', participantes: 3 },
];
