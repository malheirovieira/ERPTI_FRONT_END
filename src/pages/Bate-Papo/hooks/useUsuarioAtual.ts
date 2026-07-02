import { useAuthStore } from '../../TI/SuporteTecnico/store/useAuthStore';

export interface UsuarioAtual {
  id: number;
  nome: string;
}

export function useUsuarioAtual(): UsuarioAtual {
  const { usuario } = useAuthStore();
  return { id: usuario?.id ?? 0, nome: usuario?.nome ?? 'Você' };
}