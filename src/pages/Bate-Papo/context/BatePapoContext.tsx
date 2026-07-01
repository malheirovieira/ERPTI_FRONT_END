import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import type { MensagemRetornoDTO, EnviarMensagemPayload } from '../types/batePapo.types';
import { buscarHistoricoCanal } from '../services/batePapoApi';
import { inscreverNoCanal, enviarMensagemWS } from '../services/websocketClient';
import { useUsuarioAtual } from '../hooks/useUsuarioAtual';

interface BatePapoContextData {
  mensagens: MensagemRetornoDTO[];
  canalAtivo: number | null;
  carregando: boolean;
  totalNaoLidas: number;
  conectarCanal: (canalId: number) => Promise<void>;
  enviarMensagem: (canalId: number, conteudo: string) => void;
}

const BatePapoContext = createContext<BatePapoContextData | undefined>(undefined);

export const BatePapoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const usuarioAtual = useUsuarioAtual();
  const [mensagens, setMensagens] = useState<MensagemRetornoDTO[]>([]);
  const [canalAtivo, setCanalAtivo] = useState<number | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [totalNaoLidas, setTotalNaoLidas] = useState(0);

  const canalAtivoRef = useRef<number | null>(null);

  const conectarCanal = useCallback(async (canalId: number) => {
    canalAtivoRef.current = canalId;
    setCanalAtivo(canalId);
    setCarregando(true);
    setMensagens([]);
    setTotalNaoLidas(0);

    try {
      const historico = await buscarHistoricoCanal(canalId);
      if (canalAtivoRef.current !== canalId) return;
      setMensagens(historico);
    } catch (erro) {
      console.error('Erro ao buscar histórico do canal:', erro);
    } finally {
      if (canalAtivoRef.current === canalId) setCarregando(false);
    }

    inscreverNoCanal(canalId, (novaMensagem) => {
      // CORREÇÃO: Acessando 'remetente.id' ou 'remetente' dependendo da sua estrutura
      // Se 'remetente' for o objeto que contém o ID:
      const remetenteIdDaMensagem = typeof novaMensagem.remetente === 'object' 
        ? (novaMensagem.remetente as any).id 
        : novaMensagem.remetente;

      if (canalAtivoRef.current !== canalId && remetenteIdDaMensagem !== usuarioAtual.id) {
        setTotalNaoLidas((prev) => prev + 1);
      }

      if (canalAtivoRef.current !== canalId) return;
      setMensagens((atual) => [...atual, novaMensagem]);
    });
  }, [usuarioAtual.id]);

  const enviarMensagem = useCallback(
    (canalId: number, conteudo: string) => {
      const payload: EnviarMensagemPayload = {
        canalId,
        remetenteId: usuarioAtual.id,
        conteudo,
      };
      enviarMensagemWS(payload);
    },
    [usuarioAtual.id]
  );

  return (
    <BatePapoContext.Provider value={{ mensagens, canalAtivo, carregando, totalNaoLidas, conectarCanal, enviarMensagem }}>
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