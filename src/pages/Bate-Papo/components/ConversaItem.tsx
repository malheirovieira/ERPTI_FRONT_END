import React from 'react';
import { Avatar } from './Avatar';
import type { Conversa } from '../mocks/conversasMock';
import { useBatePapo } from '../context/BatePapoContext';

interface Props {
  conversa: Conversa;
  ativa: boolean;
  onClick: () => void;
}

const tipoAvatar = (tipo: Conversa['tipo']) =>
  tipo === 'individual' ? 'pessoa' : tipo === 'grupo' ? 'grupo' : 'global';

export const ConversaItem: React.FC<Props> = ({ conversa, ativa, onClick }) => {
  const { naoLidasPorCanal } = useBatePapo();
  const qtdNaoLidas = naoLidasPorCanal[conversa.id] ?? 0;

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2 mr-2 rounded-r-full cursor-pointer ${
        ativa ? 'bg-orange-50' : 'hover:bg-[#f1f3f4]'
      }`}
    >
      <Avatar nome={conversa.nome} tipo={tipoAvatar(conversa.tipo)} tamanho={32} online={conversa.online} />
      <div className="flex-1 min-w-0">
        <p className={`text-[13.5px] truncate ${ativa ? 'text-[#E95C13] font-bold' : 'text-gray-900 font-medium'}`}>
          {conversa.nome}
        </p>
        <p className="text-xs text-gray-500 truncate max-w-[170px]">{conversa.preview}</p>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className="text-[11px] text-gray-500">{conversa.hora}</span>
        {qtdNaoLidas > 0 && (
          <span className="min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-[#E95C13] text-white text-[10px] font-bold animate-pulse">
            {qtdNaoLidas > 9 ? '9+' : qtdNaoLidas}
          </span>
        )}
      </div>
    </div>
  );
};