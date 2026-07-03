import { useEffect, useState } from 'react';
import { inscreverPresenca } from '../services/websocketClient';
import type { PresencaEvento } from '../types/batePapo.types';

export function useChatNotifications(usuarioId: number) {
  const [usuariosOnline, setUsuariosOnline] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!usuarioId) return;

    // Inscreve no tópico global de presença dos usuários da TI/ENGEBAG
    const presencaHandle = inscreverPresenca((evento: PresencaEvento) => {
      setUsuariosOnline((prev) => {
        const novoSet = new Set(prev);
        
        // Mapeamento seguro: tenta ler 'online', 'ativo' ou propriedades dinâmicas do evento
        const dados = evento as any;
        const estaOnline = dados.online === true || dados.ativo === true || dados.status === 'ONLINE';

        if (estaOnline) {
          novoSet.add(dados.usuarioId);
        } else {
          novoSet.delete(dados.usuarioId);
        }
        return novoSet;
      });
    });

    return () => {
      presencaHandle.unsubscribe();
    };
  }, [usuarioId]);

  /**
   * Verifica se um determinado colega está online no sistema
   */
  const isUsuarioOnline = (id: number): boolean => {
    return usuariosOnline.has(id);
  };

  return {
    usuariosOnline,
    isUsuarioOnline,
  };
}