// TODO: substituir por busca real (ex: GET /api/usuarios?busca=texto)
export interface PessoaSelecionavel {
  id: number;
  nome: string;
  email: string;
}

export const PESSOAS_MOCK: PessoaSelecionavel[] = [
  { id: 1, nome: 'Mariana Souza', email: 'mariana.souza@engebag.com' },
  { id: 2, nome: 'Carlos Eduardo', email: 'carlos.eduardo@engebag.com' },
  { id: 3, nome: 'Fernanda Lima', email: 'fernanda.lima@engebag.com' },
  { id: 4, nome: 'Roberto Alves', email: 'roberto.alves@engebag.com' },
  { id: 5, nome: 'Ana Paula', email: 'ana.paula@engebag.com' },
  { id: 6, nome: 'João Pedro', email: 'joao.pedro@engebag.com' },
  { id: 7, nome: 'Pedro Henrique', email: 'pedro.henrique@engebag.com' },
];
