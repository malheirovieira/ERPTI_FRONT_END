// TODO: substitua pelo hook real de autenticação do projeto
// (ex: useAuth(), useContext(AuthContext), ou decodificar o JWT salvo no login)
export interface UsuarioAtual {
  id: number;
  nome: string;
}

export function useUsuarioAtual(): UsuarioAtual {
  return { id: 1, nome: 'Você' };
}
