import { useContext } from 'react';
// Importe seu contexto real de autenticação aqui, ex:
// import { AuthContext } from '../context/AuthContext'; 

export interface UsuarioAtual {
  id: number;
  nome: string;
}

export function useUsuarioAtual(): UsuarioAtual {
  // const { user } = useContext(AuthContext);
  // return { id: user?.id ?? 1, nome: user?.nome ?? 'Usuário' };
  
  // Mantenha assim por enquanto até plugar seu contexto:
  return { id: 1, nome: 'Você' }; 
}