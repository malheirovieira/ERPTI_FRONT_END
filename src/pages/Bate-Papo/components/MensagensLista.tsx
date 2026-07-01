import React, { useEffect, useRef } from 'react';
import type { MensagemRetornoDTO } from '../types/batePapo.types';
import { MensagemItem } from './MensagemItem';
import type { Conversa } from '../mocks/conversasMock';

interface Props {
  mensagens: MensagemRetornoDTO[];
  conversa: Conversa;
  usuarioAtualId: number;
  carregando: boolean;
}

export const MensagensLista: React.FC<Props> = ({ mensagens, conversa, usuarioAtualId, carregando }) => {
  const fimRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4">
      {conversa.tipo === 'global' && (
        <div className="bg-orange-50 text-[#E95C13] text-[12.5px] font-medium px-3.5 py-2.5 rounded-lg mb-4">
          Espaço visível para todos os colaboradores da empresa
        </div>
      )}

      {carregando && <p className="text-sm text-gray-400 text-center mt-8">Carregando mensagens...</p>}

      {!carregando && mensagens.length === 0 && (
        <p className="text-sm text-gray-400 text-center mt-8">Nenhuma mensagem ainda. Diga oi 👋</p>
      )}

      {mensagens.map((msg, index) => {
        const ehMinha = msg.remetente?.id === usuarioAtualId;
        const mostrarCabecalho =
          index === 0 || mensagens[index - 1]?.remetente?.id !== msg.remetente?.id;

        return (
          <MensagemItem key={msg.id} mensagem={msg} ehMinha={ehMinha} mostrarCabecalho={mostrarCabecalho} />
        );
      })}
      <div ref={fimRef} />
    </div>
  );
};
