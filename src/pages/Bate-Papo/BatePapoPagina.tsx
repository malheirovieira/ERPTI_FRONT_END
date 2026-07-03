import React, { useEffect, useState } from 'react';
import { useBatePapo } from './context/BatePapoContext';
import { ListaConversas } from './components/ListaConversas';
import { ChatHeader } from './components/ChatHeader';
import { MensagensLista } from './components/MensagensLista';
import { CaixaTexto } from './components/CaixaTexto';
import type { Conversa } from './mocks/conversasMock';
import type { PessoaSelecionavel } from './mocks/pessoasMock';
import { criarNovoCanal, fetchCanaisUsuario } from '../../services/api'; 
// IMPORTAÇÃO CHAVE: Conecta o Chat ao mesmo gerenciador de login do suporte
import { useAuthStore } from '../TI/SuporteTecnico/store/useAuthStore'; 

export const BatePapoPagina: React.FC = () => {
  const { mensagens, carregando, conectarCanal, enviarMensagem } = useBatePapo();
  
  // Substituímos o hook antigo pelo seu Zustand Store global
  const { usuario, fetchUsuarioLogado } = useAuthStore();

  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [conversaAtiva, setConversaAtiva] = useState<Conversa | null>(null);

  // 1. GARANTIA DE SESSÃO: Se a página atualizar e o estado sumir, força o Zustand a buscar o usuário de novo
  useEffect(() => {
    if (!usuario) {
      fetchUsuarioLogado();
    }
  }, [usuario, fetchUsuarioLogado]);

  // 2. HISTÓRICO REAL: Dispara a busca no PostgreSQL usando o ID garantido do seu useAuthStore
  useEffect(() => {
    if (!usuario?.id) return;

    fetchCanaisUsuario(usuario.id)
      .then((canais: any[]) => {
        if (!canais) return;
        
        const listaMapeada: Conversa[] = canais.map((canal) => {
          // A MÁGICA: O backend envia os participantes, pegamos o que NÃO é o usuário logado
          const interlocutor = canal.participantes?.find((p: any) => Number(p.id) !== Number(usuario.id));
          
          return {
            id: canal.id,
            nome: interlocutor ? interlocutor.nome : canal.nome,
            tipo: canal.tipo.toLowerCase() === 'privado' ? 'individual' : 'grupo',
            preview: 'Clique para abrir',
            hora: 'Ativo',
            naoLidas: 0
          };
        });
        setConversas(listaMapeada);
      })
      .catch((err) => console.error('Erro ao buscar conversas:', err));
  }, [usuario?.id]);

  useEffect(() => {
    if (conversaAtiva) conectarCanal(conversaAtiva.id);
  }, [conversaAtiva?.id, conectarCanal]);

  const handleIniciarNovoChat = async (pessoas: PessoaSelecionavel[]) => {
    if (!pessoas || pessoas.length === 0) return;
    
    const usuarioSelecionado = pessoas[0];
    console.log('Iniciando chat via API com:', usuarioSelecionado);

    try {
      const canalCriado = await criarNovoCanal({
        nome: usuarioSelecionado.nome,
        tipo: 'PRIVADO',
        // Passa o ID do Gabriel Malheiro logado junto com o do Henrique para o Java vinculá-los no Set<User>
        usuarioIds: [usuario.id, usuarioSelecionado.id]
      });

      const novaConversa: Conversa = {
        id: canalCriado.id, 
        nome: usuarioSelecionado.nome,
        tipo: 'individual', 
        preview: 'Conversa iniciada', 
        hora: 'Agora', 
        naoLidas: 0
      };

      setConversas((anteriores) => {
        const jaExiste = anteriores.some((c) => c.id === novaConversa.id);
        if (jaExiste) return anteriores;
        return [novaConversa, ...anteriores];
      });

      setConversaAtiva(novaConversa);

    } catch (err) {
      console.error('Erro ao iniciar novo chat no back-end:', err);
    }
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
          {/* Injeta o ID real do Zustand na renderização da lista de balões */}
          <MensagensLista mensagens={mensagens} conversa={conversaAtiva} usuarioAtualId={usuario?.id ?? 0} carregando={carregando} />
          <CaixaTexto placeholder={`Enviar mensagem para ${conversaAtiva.nome}`} onEnviar={(t) => enviarMensagem(conversaAtiva.id, t)} />
        </section>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">Selecione uma conversa</div>
      )}
    </div>
  );
};
