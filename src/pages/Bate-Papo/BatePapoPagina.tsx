import React, { useEffect, useState } from 'react';
import { useBatePapo } from './context/BatePapoContext';
import { useUsuarioAtual } from './hooks/useUsuarioAtual';
import { ListaConversas } from './components/ListaConversas';
import { ChatHeader } from './components/ChatHeader';
import { MensagensLista } from './components/MensagensLista';
import { CaixaTexto } from './components/CaixaTexto';
import type { Conversa } from './mocks/conversasMock';
import type { PessoaSelecionavel } from './mocks/pessoasMock';

export const BatePapoPagina: React.FC = () => {
  const { mensagens, carregando, conectarCanal, enviarMensagem } = useBatePapo();
  const usuarioAtual = useUsuarioAtual();

  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [conversaAtiva, setConversaAtiva] = useState<Conversa | null>(null);

  useEffect(() => {
    if (conversaAtiva) conectarCanal(conversaAtiva.id);
  }, [conversaAtiva?.id, conectarCanal]);

  const handleIniciarNovoChat = (pessoas: PessoaSelecionavel[]) => {
    console.log('Iniciando chat com:', pessoas);
    // Aqui você chama sua API para criar a conversa
  };

  return (
    <div className="flex h-full w-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <ListaConversas
        conversas={conversas}
        conversaAtivaId={conversaAtiva?.id ?? 0}
        onSelecionar={setConversaAtiva}
        onIniciarNovoChat={handleIniciarNovoChat}
      />

      {conversaAtiva ? (
        <section className="flex-1 flex flex-col min-w-0">
          <ChatHeader conversa={conversaAtiva} />
          <MensagensLista mensagens={mensagens} conversa={conversaAtiva} usuarioAtualId={usuarioAtual.id} carregando={carregando} />
          <CaixaTexto placeholder={`Enviar mensagem para ${conversaAtiva.nome}`} onEnviar={(t) => enviarMensagem(conversaAtiva.id, t)} />
        </section>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">Selecione uma conversa</div>
      )}
    </div>
  );
};