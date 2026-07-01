import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import type { MensagemRetornoDTO, EnviarMensagemPayload } from '../types/batePapo.types';
import { buscarHistoricoCanal } from '../services/batePapoApi';
import { inscreverNoCanal, enviarMensagemWS } from '../services/websocketClient';
import { useUsuarioAtual } from '../hooks/useUsuarioAtual';

interface BatePapoContextData {
  mensagens: MensagemRetornoDTO[];
  canalAtivo: number | null;
  carregando: boolean;
  /** Busca o histórico (REST) e se inscreve no tópico do canal (WebSocket) */
  conectarCanal: (canalId: number) => Promise<void>;
  /** Publica uma mensagem no canal informado */
  enviarMensagem: (canalId: number, conteudo: string) => void;
}

const BatePapoContext = createContext<BatePapoContextData | undefined>(undefined);

export const BatePapoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const usuarioAtual = useUsuarioAtual();
  const [mensagens, setMensagens] = useState<MensagemRetornoDTO[]>([]);
  const [canalAtivo, setCanalAtivo] = useState<number | null>(null);
  const [carregando, setCarregando] = useState(false);

  // guarda o canal ativo "de verdade" (sem esperar o re-render do state),
  // usado para descartar respostas/mensagens de um canal que o usuário já trocou
  const canalAtivoRef = useRef<number | null>(null);

  const conectarCanal = useCallback(async (canalId: number) => {
    canalAtivoRef.current = canalId;
    setCanalAtivo(canalId);
    setCarregando(true);
    setMensagens([]);

    try {
      // 1) histórico salvo (REST)
      const historico = await buscarHistoricoCanal(canalId);
      if (canalAtivoRef.current !== canalId) return; // usuário já trocou de canal enquanto buscava
      setMensagens(historico);
    } catch (erro) {
      console.error('Erro ao buscar histórico do canal:', erro);
    } finally {
      if (canalAtivoRef.current === canalId) setCarregando(false);
    }

    // 2) tempo real (WebSocket) — inscreverNoCanal já cancela a inscrição anterior
    inscreverNoCanal(canalId, (novaMensagem) => {
      if (canalAtivoRef.current !== canalId) return;
      setMensagens((atual) => [...atual, novaMensagem]);
    });
  }, []);

  const enviarMensagem = useCallback(
    (canalId: number, conteudo: string) => {
      const payload: EnviarMensagemPayload = {
        canalId,
        remetenteId: usuarioAtual.id,
        conteudo,
      };
      enviarMensagemWS(payload);
      // a própria mensagem enviada volta pelo /topic/canal/{canalId} e é adicionada
      // pelo listener acima — por isso NÃO a inserimos manualmente aqui (evita duplicar).
    },
    [usuarioAtual.id]
  );

  return (
    <BatePapoContext.Provider value={{ mensagens, canalAtivo, carregando, conectarCanal, enviarMensagem }}>
      {children}
    </BatePapoContext.Provider>
  );
};

export function useBatePapo() {
  const contexto = useContext(BatePapoContext);
  if (!contexto) {
    throw new Error('useBatePapo deve ser usado dentro de um BatePapoProvider');
  }
  return contexto;
}
