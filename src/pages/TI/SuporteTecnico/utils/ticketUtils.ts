export const formatarStatus = (status: string | undefined | null): string => {
  const mapa: Record<string, string> = {
    'ABERTO': 'Aberto',
    'EM_ANDAMENTO': 'Em Andamento',
    'EM ANDAMENTO': 'Em Andamento',
    'RESOLVIDO': 'Resolvido',
    'FECHADO': 'Finalizado'
  };
  return mapa[status?.toUpperCase() || ''] || status || 'Indefinido';
};