import React, { useEffect, useState } from 'react';
import { CriarPost } from './components/CriarPost';
import { FeedPost } from './components/FeedPost';
import { postService } from './services/postService';
import type { AvisoResponse } from './types/post';

export function VisaoGeral() {
  const [posts, setPosts] = useState<AvisoResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const carregarFeed = async () => {
    setLoading(true);
    try {
      const data = await postService.listarFeed();
      setPosts(data);
    } catch (error) {
      console.error("Erro ao carregar o feed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarFeed();
  }, []);

  const handleExcluir = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este aviso?")) {
      try {
        await postService.excluirAviso(id);
        setPosts(posts.filter(post => post.id !== id));
      } catch (error) {
        console.error("Erro ao excluir:", error);
        alert("Erro ao excluir o aviso. Você tem permissão?");
      }
    }
  };

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto p-4 md:p-6 gap-6">
      
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Mural de Avisos
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Acompanhe os avisos e atualizações recentes da empresa.
        </p>
      </div>

      {/* Caixa de Criação de Post */}
      <CriarPost onPostCreated={carregarFeed} />

      <hr className="border-gray-200 dark:border-gray-700" />

      {/* Listagem do Feed */}
      <div className="flex flex-col">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            Nenhum aviso publicado recentemente.
          </div>
        ) : (
          posts.map(post => (
            <FeedPost 
              key={post.id} 
              post={post} 
              onDelete={handleExcluir} 
              podeDeletar={true} // Aqui futuramente você pode passar a checagem se o usuário é ADMIN ou o autor
            />
          ))
        )}
      </div>

    </div>
  );
}