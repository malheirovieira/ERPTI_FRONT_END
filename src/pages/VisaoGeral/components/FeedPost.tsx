import React from 'react';
import type { AvisoResponse } from '../types/post';

interface FeedPostProps {
  post: AvisoResponse;
  onDelete?: (id: number) => void;
  podeDeletar?: boolean;
}

export function FeedPost({ post, onDelete, podeDeletar = false }: FeedPostProps) {
  const dataFormatada = new Date(post.dataCriacao).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  // Monta a string de cargo e setor (ex: "Analista de T.I. - Tecnologia")
  const subtituloProfissional = [post.cargoCriador, post.setorCriador]
    .filter(Boolean) // Remove valores vazios/nulos
    .join(' - ');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-5 transition-all hover:shadow-md">
      
      {/* Cabeçalho do Post */}
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-orange-600 font-bold overflow-hidden border border-orange-100">
            {post.fotoCriador ? (
              <img src={post.fotoCriador} alt="Perfil" className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg">{post.nomeCriador.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div>
            <p className="font-bold text-gray-800 tracking-tight">{post.nomeCriador}</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              {subtituloProfissional} <span className="mx-1.5 font-normal text-gray-300">•</span> <span className="font-normal text-gray-400">{dataFormatada}</span>
            </p>
          </div>
        </div>

        {podeDeletar && (
          <button 
            onClick={() => onDelete && onDelete(post.id)}
            className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
            title="Excluir Aviso"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {/* Conteúdo do Post */}
      <div className="pl-1">
        <h3 className="font-bold text-xl text-gray-900 mb-3">{post.titulo}</h3>
        <p className="text-gray-600 whitespace-pre-wrap text-base leading-relaxed">
          {post.conteudo}
        </p>
        
        {post.urlImagem && (
          <div className="mt-5 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex justify-center">
            <img src={post.urlImagem} alt="Anexo do aviso" className="max-w-full h-auto object-cover max-h-[500px]" />
          </div>
        )}
      </div>
      
    </div>
  );
}