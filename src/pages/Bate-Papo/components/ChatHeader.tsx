import React from 'react';
import { Avatar } from './Avatar';
import type { Conversa } from '../mocks/conversasMock';
import { useBatePapo } from '../context/BatePapoContext';

interface Props {
  conversa: Conversa;
}

const tipoAvatar = (tipo: Conversa['tipo']) =>
  tipo === 'individual' ? 'pessoa' : tipo === 'grupo' ? 'grupo' : 'global';

export const ChatHeader: React.FC<Props> = ({ conversa }) => {
  const { usuariosOnline, digitandoPorCanal } = useBatePapo();
  
  // Evita o erro do TypeScript buscando a propriedade dinamicamente ou usando o id do canal/usuário
  const idUsuarioMapeado = (conversa as any).usuarioId || conversa.id;
  const estaOnline = usuariosOnline.has(idUsuarioMapeado);
  
  // Verifica se há alguém digitando neste canal específico
  const quemDigita = digitandoPorCanal[conversa.id];

  return (
    <div className="h-16 shrink-0 border-b border-[#dee2e6] flex items-center justify-between px-5">
      <div className="flex items-center gap-3">
        {/* Força o tipo de avatar baseado na natureza real do chat aberto */}
        <Avatar nome={conversa.nome} tipo={tipoAvatar(conversa.tipo)} tamanho={36} />
        <div>
          <p className="text-[16px] font-medium text-gray-900">{conversa.nome}</p>
          <div className="text-xs text-gray-500 flex items-center gap-1.5">
            {quemDigita ? (
              <span className="text-[#E95C13] italic">{quemDigita} está digitando...</span>
            ) : conversa.tipo === 'individual' ? (
              <>
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: estaOnline ? '#1e8e3e' : '#9aa3ad' }}
                />
                <span>{estaOnline ? 'online' : 'offline'}</span>
              </>
            ) : (
              <span>{conversa.participantes ?? 0} participantes</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};