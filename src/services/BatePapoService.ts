import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
// Importamos a URL centralizada do seu arquivo api.ts
import { API_URL_CHAT } from '../services/api'; 

// Constrói a URL do WebSocket usando a constante unificada
const SOCKET_URL = `${API_URL_CHAT}/ws-gestao`; 

class BatePapoService {
  private client: Client;

  constructor() {
    this.client = new Client({
      webSocketFactory: () => new SockJS(SOCKET_URL),
      debug: (str) => console.log('STOMP (BatePapo): ' + str),
      reconnectDelay: 5000,
    });
  }

  connect(token: string, onConnect: () => void) {
    this.client.connectHeaders = { 'Authorization': `Bearer ${token}` };
    this.client.onConnect = () => {
      console.log('Conectado ao BatePapo!');
      onConnect();
    };
    this.client.activate();
  }

  subscribe(canalId: number, callback: (msg: any) => void) {
    return this.client.subscribe(`/topic/canal/${canalId}`, (message) => {
      callback(JSON.parse(message.body));
    });
  }

  sendMessage(canalId: number, remetenteId: number, conteudo: string) {
    this.client.publish({
      destination: '/app/batepapo/enviar',
      body: JSON.stringify({ canalId, remetenteId, conteudo }),
    });
  }

  disconnect() {
    this.client.deactivate();
  }
}

export default new BatePapoService();