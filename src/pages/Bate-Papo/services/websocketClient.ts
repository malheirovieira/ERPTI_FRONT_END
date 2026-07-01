import { Client, type IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ENDPOINTS } from '../config/api.config';
import type { EnviarMensagemPayload, MensagemRetornoDTO } from '../types/batePapo.types';


// TODO: troque por como seu projeto já busca o token (AuthContext, localStorage, cookie httpOnly...)
function obterToken(): string | null {
  return localStorage.getItem('token');
}

let clienteStomp: Client | null = null;
let assinaturaAtual: { unsubscribe: () => void } | null = null;

function obterCliente(): Client {
  if (clienteStomp) return clienteStomp;

  clienteStomp = new Client({
    webSocketFactory: () => new SockJS(ENDPOINTS.wsConexao),
    connectHeaders: {
      Authorization: `Bearer ${obterToken() ?? ''}`,
    },
    reconnectDelay: 5000,
    debug: () => {}, // troque por console.log para depurar a conexão STOMP
  });

  return clienteStomp;
}

/**
 * Conecta (se necessário) e inscreve no tópico do canal informado.
 * Cancela automaticamente a inscrição anterior, se houver — garante que
 * o usuário nunca fique recebendo mensagens de mais de um canal ao mesmo tempo.
 */
export function inscreverNoCanal(
  canalId: number,
  aoReceberMensagem: (msg: MensagemRetornoDTO) => void
) {
  const cliente = obterCliente();

  const inscrever = () => {
    assinaturaAtual?.unsubscribe();
    assinaturaAtual = cliente.subscribe(ENDPOINTS.wsTopicoCanal(canalId), (frame: IMessage) => {
      const mensagem: MensagemRetornoDTO = JSON.parse(frame.body);
      aoReceberMensagem(mensagem);
    });
  };

  if (cliente.connected) {
    inscrever();
  } else {
    cliente.onConnect = inscrever;
    if (!cliente.active) cliente.activate();
  }
}

/** Publica em /app/batepapo/enviar */
export function enviarMensagemWS(payload: EnviarMensagemPayload) {
  const cliente = obterCliente();
  if (!cliente.connected) {
    console.warn('STOMP ainda não conectado — mensagem descartada. Considere enfileirar e reenviar ao reconectar.');
    return;
  }
  cliente.publish({
    destination: ENDPOINTS.wsEnviarMensagem,
    body: JSON.stringify(payload),
  });
}

/** Encerra a conexão (ex: logout) */
export function desconectarWS() {
  assinaturaAtual?.unsubscribe();
  assinaturaAtual = null;
  clienteStomp?.deactivate();
  clienteStomp = null;
}
