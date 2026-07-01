# Pasta Chat — Bate-Papo Corporativo

## Instalação

Este projeto usa STOMP sobre SockJS para o tempo real:

```bash
npm install @stomp/stompjs sockjs-client
npm install -D @types/sockjs-client
```

## Variável de ambiente

Crie/edite o `.env` na raiz do front-end:

```
VITE_API_BASE_URL=http://localhost:8080
```

## Onde plugar no app

1. Envolva sua aplicação (ou pelo menos as rotas do bate-papo) com o provider:

```tsx
import { BatePapoProvider } from './context/BatePapoContext';

<BatePapoProvider>
  <BatePapoPagina />
</BatePapoProvider>
```

2. A rota da página continua sendo `src/pages/Chat/BatePapoPagina.tsx`.

## Estrutura de arquivos

```
src/
  config/
    api.config.ts          -> URLs do back-end (REST + WebSocket)
  types/
    batePapo.types.ts      -> DTOs (MensagemRetornoDTO, EnviarMensagemPayload)
  services/
    batePapoApi.ts         -> GET /api/batepapo/historico/{canalId}
    websocketClient.ts     -> conexão STOMP/SockJS, inscrever/publicar
  hooks/
    useUsuarioAtual.ts     -> [MOCK] troque pelo seu hook de autenticação real
  context/
    BatePapoContext.tsx    -> conectarCanal() + enviarMensagem()
  pages/Chat/
    BatePapoPagina.tsx     -> orquestra a tela inteira
    mocks/
      conversasMock.ts     -> [MOCK] lista de conversas da sidebar
      pessoasMock.ts        -> [MOCK] pessoas para o modal "Novo chat"
    utils/
      chatHelpers.ts        -> formatarHora / formatarDivisorDia
    components/
      Avatar.tsx
      ListaConversas.tsx
      ConversaItem.tsx
      ChatHeader.tsx
      MensagensLista.tsx
      MensagemItem.tsx
      CaixaTexto.tsx
      NovaConversaModal.tsx -> fluxo unificado individual/grupo (inspirado no Google Chat)
```

## O que ainda é MOCK e precisa de endpoint real

| Arquivo | O que está mockado | Endpoint sugerido |
|---|---|---|
| `hooks/useUsuarioAtual.ts` | id/nome do usuário logado | trocar por `AuthContext` / decodificar JWT |
| `mocks/conversasMock.ts` | lista de conversas (DMs, grupos, global) | `GET /api/batepapo/canais` (não existe ainda na doc) |
| `mocks/pessoasMock.ts` | pessoas para criar conversa | `GET /api/usuarios?busca=` |
| `BatePapoPagina.tsx` → `handleIniciarChat` | criação de canal ao iniciar chat | `POST /api/batepapo/canais` |

Tudo que já é real e funcional, conforme a documentação:

- Histórico: `GET /api/batepapo/historico/{canalId}` ✅
- Conexão WebSocket: `/ws-gestao` com header `Authorization: Bearer <token>` ✅
- Envio: publica em `/app/batepapo/enviar` com `{ canalId, remetenteId, conteudo }` ✅
- Recebimento em tempo real: inscrito em `/topic/canal/{canalId}` ✅
