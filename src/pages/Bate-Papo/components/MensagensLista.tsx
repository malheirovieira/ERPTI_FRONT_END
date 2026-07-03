import React, { useEffect, useRef } from 'react';
import { MensagemItem } from './MensagemItem';

export const MensagensLista: React.FC<any> = ({ mensagens, conversa, usuarioAtualId, carregando }) => {
  const fimRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  // LOG DE DEBUG PARA VOCÊ VER O QUE ESTÁ RENDERIZANDO
  console.log("Total de mensagens no estado:", mensagens?.length);

  if (carregando) return <p className="text-center p-4">Carregando...</p>;

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4">
      {mensagens?.map((msg: any, index: number) => {
        // Tenta pegar o ID de várias formas possíveis dependendo do seu DTO
        const remetenteId = msg.remetente?.id || msg.usuarioId || msg.idUsuario;
        const ehMinha = Number(remetenteId) === Number(usuarioAtualId);
        
        // Verifica o anterior para o cabeçalho
        const anteriorId = index > 0 ? (mensagens[index - 1].remetente?.id || mensagens[index - 1].usuarioId) : null;
        const mostrarCabecalho = index === 0 || Number(anteriorId) !== Number(remetenteId);

        return (
          <MensagemItem 
            key={msg.id || index} 
            mensagem={msg} 
            ehMinha={ehMinha} 
            mostrarCabecalho={mostrarCabecalho} 
          />
        );
      })}
      <div ref={fimRef} />
    </div>
  );
};