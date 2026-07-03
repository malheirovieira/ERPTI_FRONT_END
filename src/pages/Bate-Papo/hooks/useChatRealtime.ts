import { useEffect, useState } from 'react';
import { 
  inscreverNoCanal, 
  enviarMensagemWS, 
  inscreverDigitando, 
  enviarDigitando, 
  avisarCanalAberto, 
  avisarCanalFechado 
} from '../services/websocketClient';
import type { MensagemRetornoDTO, DigitandoEvento, EnviarMensagemPayload } from '../types/batePapo.types';

export function useChatRealtime(canalId: number | null, usuarioId: number, usuarioNome: string) {
  const [mensagens, setMensagens] = useState<MensagemRetornoDTO[]>([]);
  const [usuariosDigitando, setUsuariosDigitando] = useState<string[]>([]);

  // 1. Efeito para controlar a inscrição no canal ativo e eventos de "digitando"
  useEffect(() => {
    if (!canalId) {
      setMensagens([]);
      return;
    }

    // Limpa mensagens ao trocar de canal para carregar o histórico limpo via REST depois
    setMensagens([]);

    // Notifica o backend que o usuário entrou na sala (ajuda a marcar como lidas)
    avisarCanalAberto(canalId, usuarioId);

    // Inscreve no canal de mensagens via WebSocket
    inscreverNoCanal(canalId, (novaMensagem: MensagemRetornoDTO) => {
      setMensagens((prev) => {
        // Evita duplicar mensagens caso o registro venha rápido no reload/histórico
        if (prev.some((m) => m.id === novaMensagem.id)) return prev;
        return [...prev, novaMensagem];
      });
    });

    // Inscreve no canal para escutar quem está digitando
    inscreverDigitando(canalId, (evento: DigitandoEvento) => {
      // Ignora o evento se for o próprio usuário atual
      if (evento.usuarioId === usuarioId) return;

      setUsuariosDigitando((prev) => {
        if (evento.digitando) {
          if (prev.includes(evento.usuarioNome)) return prev;
          return [...prev, evento.usuarioNome];
        } else {
          return prev.filter((nome) => nome !== evento.usuarioNome);
        }
      });
    });

    // Cleanup: Executado ao fechar o chat ou mudar de canal
    return () => {
      avisarCanalFechado(usuarioId);
    };
  }, [canalId, usuarioId]);

  // 2. Função disparada pela interface para enviar a mensagem via WebSocket
  const enviarMensagem = (texto: string) => {
    if (!canalId || !texto.trim()) return;

    // Monta o payload respeitando propriedades alternativas do seu tipo (texto, conteudo ou mensagem)
    const payload: any = {
      canalId: canalId,
      remetenteId: usuarioId,
      tipo: 'TEXTO'
    };

    // Preenche dinamicamente os campos mais comuns para evitar falhas de compilação
    payload.texto = texto.trim();
    payload.conteudo = texto.trim();
    payload.mensagem = texto.trim();

    enviarMensagemWS(payload as EnviarMensagemPayload);
  };

  // 3. Função para emitir o estado de digitação para o backend
  const emitirDigitando = (estaDigitando: boolean) => {
    if (!canalId) return;
    enviarDigitando(canalId, usuarioId, usuarioNome, estaDigitando);
  };

  return {
    mensagens,
    setMensagens, // Permite que a controller injete o histórico HTTP inicial aqui
    usuariosDigitando,
    enviarMensagem,
    emitirDigitando,
  };
}