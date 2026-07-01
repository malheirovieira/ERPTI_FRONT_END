import React, { useEffect, useState } from 'react';
import { useBatePapo } from './context/BatePapoContext';
import { useUsuarioAtual } from './hooks/useUsuarioAtual';
import { ListaConversas } from './components/ListaConversas';
import { ChatHeader } from './components/ChatHeader';
import { MensagensLista } from './components/MensagensLista';
import { CaixaTexto } from './components/CaixaTexto';
import { NovaConversaModal } from './components/NovaConversaModal';
import { CONVERSAS_MOCK, type Conversa } from './mocks/conversasMock';
import type { PessoaSelecionavel } from './mocks/pessoasMock';

export const BatePapoPagina: React.FC = () => {
  const { mensagens, carregando, conectarCanal, enviarMensagem } = useBatePapo();
  const usuarioAtual = useUsuarioAtual();

  const [conversas, setConversas] = useState<Conversa[]>(CONVERSAS_MOCK);
  const [conversaAtiva, setConversaAtiva] = useState<Conversa>(CONVERSAS_MOCK[1]);
  const [modalAberto, setModalAberto] = useState(false);

  useEffect(() => {
    conectarCanal(conversaAtiva.id);
  }, [conversaAtiva.id, conectarCanal]);

  const handleEnviar = (conteudo: string) => {
    enviarMensagem(conversaAtiva.id, conteudo);
  };

  // Fluxo unificado (inspirado no Google Chat): 1 pessoa = conversa individual, 2+ = grupo
  const handleIniciarChat = (pessoas: PessoaSelecionavel[]) => {
    const ehGrupo = pessoas.length > 1;

    // TODO: trocar por chamada real ao back-end para criar/obter o canal
    // (ex: POST /api/batepapo/canais) e usar o id retornado.
    const novaConversa: Conversa = {
      id: Date.now(),
      nome: ehGrupo ? pessoas.map((p) => p.nome.split(' ')[0]).join(', ') : pessoas[0].nome,
      tipo: ehGrupo ? 'grupo' : 'individual',
      preview: 'Conversa criada agora',
      hora: 'agora',
      participantes: ehGrupo ? pessoas.length : undefined,
      online: ehGrupo ? undefined : true,
    };

    setConversas((atual) => [novaConversa, ...atual]);
    setConversaAtiva(novaConversa);
    setModalAberto(false);
  };

  return (
    <div className="flex h-full overflow-hidden bg-white">
      <ListaConversas
        conversas={conversas}
        conversaAtivaId={conversaAtiva.id}
        onSelecionar={setConversaAtiva}
        onNovoChat={() => setModalAberto(true)}
      />

      <section className="flex-1 flex flex-col min-w-0">
        <ChatHeader conversa={conversaAtiva} />
        <MensagensLista
          mensagens={mensagens}
          conversa={conversaAtiva}
          usuarioAtualId={usuarioAtual.id}
          carregando={carregando}
        />
        <CaixaTexto
          placeholder={`Enviar mensagem para ${conversaAtiva.nome}`}
          onEnviar={handleEnviar}
        />
      </section>

      <NovaConversaModal
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
        onIniciarChat={handleIniciarChat}
      />
    </div>
  );
};