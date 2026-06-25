import React, { useState } from 'react';
import { postService } from '../services/postService';

interface CriarPostProps {
  onPostCreated: () => void; // Função para atualizar o feed após criar
}

export function CriarPost({ onPostCreated }: CriarPostProps) {
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handlePostar = async () => {
    if (!titulo.trim() || !conteudo.trim()) return;

    setLoading(true);
    try {
      await postService.criarAviso({
        titulo,
        conteudo,
        empresaAlvo: "AMBAS" // Pode ser ajustado futuramente com um select
      });
      setTitulo('');
      setConteudo('');
      setIsExpanded(false);
      onPostCreated(); // Atualiza o feed principal
    } catch (error) {
      console.error("Erro ao criar post:", error);
      alert("Não foi possível publicar o aviso.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6 transition-all focus-within:shadow-md focus-within:border-gray-200">
      {isExpanded && (
        <input
          type="text"
          placeholder="Título do aviso..."
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="w-full mb-4 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-gray-800 placeholder-gray-400 font-semibold transition-all"
        />
      )}
      
      <textarea
        placeholder="Escreva um novo aviso para a equipe..."
        value={conteudo}
        onChange={(e) => setConteudo(e.target.value)}
        onFocus={() => setIsExpanded(true)}
        rows={isExpanded ? 3 : 1}
        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none text-gray-800 placeholder-gray-400 transition-all text-base leading-relaxed"
      ></textarea>

      {isExpanded && (
        <div className="flex justify-end items-center mt-4 gap-2">
          <button 
            onClick={() => setIsExpanded(false)}
            className="text-sm px-4 py-2 font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handlePostar}
            disabled={loading || !titulo.trim() || !conteudo.trim()}
            className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold py-2.5 px-6 rounded-lg shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      )}
    </div>
  );
}