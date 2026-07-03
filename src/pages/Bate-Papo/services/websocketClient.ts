import { Client, type IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ENDPOINTS } from '../config/api.config';
import type {
  EnviarMensagemPayload,
  MensagemRetornoDTO,
  PresencaEvento,
  DigitandoEvento,
} from '../types/batePapo.types';

function obterToken(): string | null {
  return localStorage.getItem('token');
}

let clienteStomp: Client | null = null;
let assinaturaCanalAtual: { unsubscribe: () => void } | null = null;
let assinaturaDigitandoAtual: { unsubscribe: () => void } | null = null;

function obterCliente(): Client {
  if (clienteStomp) return clienteStomp;

  clienteStomp = new Client({
    webSocketFactory: () => new SockJS(ENDPOINTS.wsConexao),
    // Passamos como função para ler o localStorage atualizado a cada tentativa de conexão
    beforeConnect: () => {
      if (clienteStomp) {
        clienteStomp.connectHeaders = {
          Authorization: `Bearer ${obterToken() ?? ''}`,
        };
      }
    },
    connectHeaders: {
      Authorization: `Bearer ${obterToken() ?? ''}`,
    },
    reconnectDelay: 5000,
    debug: (str) => {
      console.log('STOMP Debug:', str); // Ativado para ajudar a monitorar a comunicação no console do navegador
    },
  });

  return clienteStomp;
}

/** Executa `acao` assim que o cliente estiver conectado (conecta se ainda não estiver ativo). */
function aoConectar(acao: () => void) {
  const cliente = obterCliente();
  if (cliente.connected) {
    acao();
    return;
  }
  const onConnectAnterior = cliente.onConnect;
  cliente.onConnect = (frame) => {
    onConnectAnterior?.(frame);
    acao();
  };
  if (!cliente.active) cliente.activate();
}

/**
 * Conecta (se necessário) e inscreve no tópico do canal informado.
 * Escuta o canal do Chamado correspondente mapeado no broker do backend: /topic/chamado/{id}
 */
export function inscreverNoCanal(
  canalId: number,
  aoReceberMensagem: (msg: MensagemRetornoDTO) => void
) {
  aoConectar(() => {
    assinaturaCanalAtual?.unsubscribe();
    // Garante a escuta correta apontando para o broker dinâmico /topic/chamado/{id}
    assinaturaCanalAtual = obterCliente().subscribe(`/topic/chamado/${canalId}`, (frame: IMessage) => {
      const mensagem: MensagemRetornoDTO = JSON.parse(frame.body);
      aoReceberMensagem(mensagem);
    });
  });
}

/** * Publica a mensagem dinamicamente na rota esperada pelo ChatController do backend.
 * Alvo corrigido para: /app/chamado/{idChamado}/enviar
 */
export function enviarMensagemWS(payload: EnviarMensagemPayload) {
  const cliente = obterCliente();
  if (!cliente.connected) {
    console.warn('STOMP ainda não conectado — mensagem descartada. Considere enfileirar e reenviar ao reconectar.');
    return;
  }

  // Verifica se o payload possui o canalId de forma segura
  const canalId = payload.canalId;
  if (!canalId) {
    console.error('Não é possível enviar mensagem via WebSocket sem um canalId válido no payload.', payload);
    return;
  }

  // Sincronizado exatamente com o @MessageMapping("/chamado/{idChamado}/enviar") do backend
  cliente.publish({
    destination: `/app/chamado/${canalId}/enviar`,
    body: JSON.stringify(payload),
  });
}

// ===== NOVO: Fase 1 - tempo real avançado =====

/** Inscreve (uma única vez por sessão) no tópico global de presença online/offline. */
export function inscreverPresenca(aoReceberEvento: (evento: PresencaEvento) => void) {
  let assinatura: { unsubscribe: () => void } | null = null;
  aoConectar(() => {
    assinatura = obterCliente().subscribe(ENDPOINTS.wsTopicoPresenca, (frame: IMessage) => {
      aoReceberEvento(JSON.parse(frame.body));
    });
  });
  return {
    unsubscribe: () => {
      if (assinatura) assinatura.unsubscribe();
    },
  };
}

/**
 * Inscreve no tópico de "digitando..." do canal informado.
 * Cancela automaticamente a inscrição anterior de "digitando" ao trocar de canal.
 */
export function inscreverDigitando(canalId: number, aoReceberEvento: (evento: DigitandoEvento) => void) {
  aoConectar(() => {
    assinaturaDigitandoAtual?.unsubscribe();
    assinaturaDigitandoAtual = obterCliente().subscribe(
      ENDPOINTS.wsTopicoDigitando(canalId),
      (frame: IMessage) => {
        aoReceberEvento(JSON.parse(frame.body));
      }
    );
  });
}

/** Publica o evento de "está digitando" / "parou de digitar" em /app/batepapo/digitando */
export function enviarDigitando(canalId: number, usuarioId: number, usuarioNome: string, digitando: boolean) {
  const cliente = obterCliente();
  if (!cliente.connected) return;
  cliente.publish({
    destination: ENDPOINTS.wsEnviarDigitando,
    body: JSON.stringify({ canalId, usuarioId, usuarioNome, digitando } as DigitandoEvento),
  });
}

/** Avisa o back-end que o usuário abriu esta conversa (o back marca as mensagens como lidas). */
export function avisarCanalAberto(canalId: number, usuarioId: number) {
  aoConectar(() => {
    obterCliente().publish({
      destination: ENDPOINTS.wsAbrirCanal,
      body: JSON.stringify({ canalId, usuarioId }),
    });
  });
}

/** Avisa o back-end que o usuário saiu da conversa activa (nenhuma fica "em foco"). */
export function avisarCanalFechado(usuarioId: number) {
  const cliente = obterCliente();
  if (!cliente.connected) return;
  cliente.publish({
    destination: ENDPOINTS.wsFecharCanal,
    body: JSON.stringify({ usuarioId }),
  });
}

/** Encerra a conexão (ex: logout) */
export function desconectarWS() {
  assinaturaCanalAtual?.unsubscribe();
  assinaturaCanalAtual = null;
  assinaturaDigitandoAtual?.unsubscribe();
  assinaturaDigitandoAtual = null;
  clienteStomp?.deactivate();
  clienteStomp = null;
}