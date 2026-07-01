import React from 'react';
import { Avatar } from './Avatar';
import type { MensagemRetornoDTO } from '../types/batePapo.types';
import { formatarHora } from '../utils/chatHelpers';

interface Props {
  mensagem: MensagemRetornoDTO;
  ehMinha: boolean;
  mostrarCabecalho: boolean;
}

export const MensagemItem: React.FC<Props> = ({ mensagem, ehMinha, mostrarCabecalho }) => {
  const nome = ehMinha ? 'Você' : mensagem.remetente?.nome ?? 'Desconhecido';

  return (
    <div className="flex gap-3 px-2 py-1 -mx-2 rounded-lg hover:bg-[#f1f3f4]">
      {mostrarCabecalho ? (
        <Avatar nome={nome} tipo="pessoa" tamanho={32} />
      ) : (
        <div className="w-8 shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        {mostrarCabecalho && (
          <div className="flex items-baseline gap-2 mb-0.5">
            <span className={`text-[13.5px] font-bold ${ehMinha ? 'text-[#E95C13]' : 'text-gray-900'}`}>
              {nome}
            </span>
            <span className="text-[11px] text-gray-500">{formatarHora(mensagem.enviadoEm)}</span>
          </div>
        )}
        <p className="text-[13.5px] leading-relaxed text-gray-700 break-words">{mensagem.conteudo}</p>
      </div>
    </div>
  );
};
