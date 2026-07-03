import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type {
  MensagemRetornoDTO,
  EnviarMensagemPayload,
  PresencaEvento,
  DigitandoEvento,
} from '../pages/Bate-Papo/types/batePapo.types';
import { buscarHistoricoCanal, buscarNaoLidasPorUsuario } from '../pages/Bate-Papo/services/batePapoApi';
import {
  inscreverNoCanal,
  enviarMensagemWS,
  inscreverPresenca,
  inscreverDigitando,
  enviarDigitando,
  avisarCanalAberto,
  avisarCanalFechado,
} from '../pages/Bate-Papo/services/websocketClient';
import { useUsuarioAtual } from '../pages/Bate-Papo/hooks/useUsuarioAtual';

interface BatePapoContextData {
  mensagens: MensagemRetornoDTO[];
  canalAtivo: number | null;
  carregando: boolean;
  totalNaoLidas: number;
  usuariosOnline: Set<number>;
  digitandoPorCanal: Record<number, string | null>;
  naoLidasPorCanal: Record<number, number>;
  conectarCanal: (canalId: number) => Promise<void>;
  sairDaConversa: () => void;
  enviarMensagem: (canalId: number, conteudo: string) => void;
  notificarDigitando: (canalId: number, digitando: boolean) => void;
}

const BatePapoContext = createContext<BatePapoContextData | undefined>(undefined);

export const BatePapoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const usuarioAtual = useUsuarioAtual();
  const [mensagens, setMensagens] = useState<MensagemRetornoDTO[]>([]);
  const [canalAtivo, setCanalAtivo] = useState<number | null>(null);
  const [carregando, setCarregando] = useState(false);

  const [usuariosOnline, setUsuariosOnline] = useState<Set<number>>(new Set());
  const [digitandoPorCanal, setDigitandoPorCanal] = useState<Record<number, string | null>>({});
  const [naoLidasPorCanal, setNaoLidasPorCanal] = useState<Record<number, number>>({});

  const canalAtivoRef = useRef<number | null>(null);
  const timeoutDigitandoRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  const totalNaoLidas = Object.values(naoLidasPorCanal).reduce((soma, qtd) => soma + qtd, 0);

  // Presença: inscreve uma única vez, na montagem do provider
  useEffect(() => {
    const assinatura = inscreverPresenca((evento: PresencaEvento) => {
      setUsuariosOnline((prev) => {
        const novo = new Set(prev);
        if (evento.online) novo.add(evento.usuarioId);
        else novo.delete(evento.usuarioId);
        return novo;
      });
    });
    return () => assinatura.unsubscribe();
  }, []);

  // Badge de não lidas: busca a contagem real do back ao carregar
  useEffect(() => {
    if (!usuarioAtual.id) return;
    buscarNaoLidasPorUsuario(usuarioAtual.id)
      .then(setNaoLidasPorCanal)
      .catch((erro) => console.error('Erro ao buscar não lidas:', erro));
  }, [usuarioAtual.id]);

  const conectarCanal = useCallback(
    async (canalId: number) => {
      // Evita chamadas se o usuário atual ainda não foi carregado/autenticado
      if (!usuarioAtual.id) return;

      // Avisa o backend que saiu da conversa anterior (se havia uma)
      if (canalAtivoRef.current !== null) {
        avisarCanalFechado(usuarioAtual.id);
      }

      canalAtivoRef.current = canalId;
      setCanalAtivo(canalId);
      setCarregando(true);
      setMensagens([]);
      setNaoLidasPorCanal((prev) => ({ ...prev, [canalId]: 0 })); // zera o badge otimisticamente

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
        if (canalAtivoRef.current !== canalId) return;
        setMensagens((atual) => [...atual, novaMensagem]);
      });

      inscreverDigitando(canalId, (evento: DigitandoEvento) => {
        if (evento.usuarioId === usuarioAtual.id) return; // ignora o próprio "digitando"
        setDigitandoPorCanal((prev) => ({
          ...prev,
          [canalId]: evento.digitando ? evento.usuarioNome : null,
        }));
      });

      // Avisa o backend que esta conversa está aberta (marca como lida do lado do servidor)
      avisarCanalAberto(canalId, usuarioAtual.id);
    },
    [usuarioAtual.id]
  );

  const sairDaConversa = useCallback(() => {
    if (canalAtivoRef.current !== null) {
      avisarCanalFechado(usuarioAtual.id);
    }
    canalAtivoRef.current = null;
    setCanalAtivo(null);
    setMensagens([]);
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

  const notificarDigitando = useCallback(
    (canalId: number, digitando: boolean) => {
      enviarDigitando(canalId, usuarioAtual.id, usuarioAtual.nome, digitando);

      if (digitando) {
        clearTimeout(timeoutDigitandoRef.current[canalId]);
        timeoutDigitandoRef.current[canalId] = setTimeout(() => {
          enviarDigitando(canalId, usuarioAtual.id, usuarioAtual.nome, false);
        }, 2000);
      } else {
        clearTimeout(timeoutDigitandoRef.current[canalId]);
      }
    },
    [usuarioAtual.id, usuarioAtual.nome]
  );

  return (
    <BatePapoContext.Provider
      value={{
        mensagens,
        canalAtivo,
        carregando,
        totalNaoLidas,
        usuariosOnline,
        digitandoPorCanal,
        naoLidasPorCanal,
        conectarCanal,
        sairDaConversa,
        enviarMensagem,
        notificarDigitando,
      }}
    >
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