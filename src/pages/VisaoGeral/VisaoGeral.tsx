// src/pages/VisaoGeral/VisaoGeral.tsx

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAuthStore } from '../TI/SuporteTecnico/store/useAuthStore';
import { postService } from './services/postService';
import type { AvisoResponse, ComentarioResponse } from './types/post';

// ─── Ícones SVG inline ────────────────────────────────────────────────────────
const IconHeart = ({ filled }: { filled?: boolean }) => (
  <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);
const IconComment = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);
const IconBookmark = ({ filled }: { filled?: boolean }) => (
  <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
);
const IconPin = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
    <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/>
  </svg>
);
const IconEdit = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);
const IconTrash = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);
const IconPhoto = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const IconAttach = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
  </svg>
);
const IconClose = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const IconDotsH = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
  </svg>
);
const IconReply = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
  </svg>
);

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface PostLocal extends AvisoResponse {
  totalCurtidas?: number;
  totalComentarios?: number;
  euCurti?: boolean;
  euFavoritei?: boolean;
  fixado?: boolean;
  urlAnexo?: string;
  editadoEm?: string;
  nomeAnexo?: string;
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ foto, nome, size = 'md' }: { foto?: string | null; nome: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' };
  const initials = nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  if (foto) {
    return (
      <img
        src={foto}
        alt={nome}
        loading="lazy"
        decoding="async"
        className={`${sizes[size]} rounded-full object-cover flex-shrink-0 ring-2 ring-white`}
      />
    );
  }
  return (
    <div
      className={`${sizes[size]} rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white ring-2 ring-white`}
      style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
    >
      {initials}
    </div>
  );
}

// ─── Imagem com carregamento lazy + skeleton ──────────────────────────────────
function LazyImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (error) return null;

  return (
    <div className="relative">
      {/* Skeleton enquanto carrega */}
      {!loaded && (
        <div className="w-full h-48 bg-gray-100 animate-pulse rounded-xl" />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`${className} transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}
      />
    </div>
  );
}

// ─── Formatação de data ───────────────────────────────────────────────────────
function dataRelativa(dateStr: string): string {
  const d = new Date(dateStr);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'agora';
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

// ─── Modal de criação / edição ────────────────────────────────────────────────
function ModalPost({ onClose, onSalvo, postEditando, usuarioFoto, usuarioNome }: {
  onClose: () => void;
  onSalvo: () => void;
  postEditando?: PostLocal | null;
  usuarioFoto?: string | null;
  usuarioNome: string;
}) {
  const [titulo, setTitulo] = useState(postEditando?.titulo ?? '');
  const [conteudo, setConteudo] = useState(postEditando?.conteudo ?? '');
  const [urlImagem, setUrlImagem] = useState(postEditando?.urlImagem ?? '');
  const [urlAnexo, setUrlAnexo] = useState(postEditando?.urlAnexo ?? '');
  const [nomeAnexo, setNomeAnexo] = useState(postEditando?.nomeAnexo ?? '');
  const [empresaAlvo, setEmpresaAlvo] = useState(postEditando?.empresaAlvo ?? 'AMBAS');
  const [enviando, setEnviando] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [uploadingAnexo, setUploadingAnexo] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { textareaRef.current?.focus(); }, []);

  const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setConteudo(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  const uploadImagem = async (file: File) => {
    setUploadingImg(true);
    try { setUrlImagem(await postService.uploadImagem(file)); }
    finally { setUploadingImg(false); }
  };

  const uploadAnexo = async (file: File) => {
    setUploadingAnexo(true);
    try {
      const { url, nomeOriginal } = await postService.uploadAnexo(file);
      setUrlAnexo(url);
      setNomeAnexo(nomeOriginal ?? file.name);
    } finally { setUploadingAnexo(false); }
  };

  const salvar = async () => {
    if (!conteudo.trim()) return;
    setEnviando(true);
    try {
      const payload = {
        titulo: titulo || conteudo.slice(0, 60),
        conteudo,
        urlImagem: urlImagem || undefined,
        urlAnexo: urlAnexo || undefined,
        empresaAlvo,
        dataExpiracao: null,
      };
      if (postEditando) {
        await postService.editarAviso(postEditando.id, payload);
      } else {
        await postService.criarAviso(payload);
      }
      onSalvo();
      onClose();
    } finally { setEnviando(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-base">{postEditando ? 'Editar post' : 'Criar post'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
            <IconClose />
          </button>
        </div>

        <div className="p-5 flex gap-3">
          <Avatar foto={usuarioFoto} nome={usuarioNome} />
          <div className="flex-1 min-w-0">
            <input value={titulo} onChange={e => setTitulo(e.target.value)}
              placeholder="Título (opcional)"
              className="w-full text-sm font-semibold text-gray-700 placeholder-gray-400 border-0 outline-none mb-2 bg-transparent" />
            <textarea ref={textareaRef} value={conteudo} onChange={autoResize}
              placeholder="O que está acontecendo?" rows={4}
              className="w-full text-base text-gray-900 placeholder-gray-400 border-0 outline-none resize-none bg-transparent leading-relaxed"
              style={{ minHeight: 100 }} />
            {urlImagem && (
              <div className="relative mt-2 rounded-xl overflow-hidden">
                <img src={urlImagem} alt="preview" loading="lazy" className="w-full max-h-56 object-cover" />
                <button onClick={() => setUrlImagem('')}
                  className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors">
                  <IconClose />
                </button>
              </div>
            )}
            {urlAnexo && (
              <div className="mt-2 flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 text-sm text-orange-700">
                <IconAttach />
                <span className="truncate flex-1">{nomeAnexo || 'Anexo'}</span>
                <button onClick={() => { setUrlAnexo(''); setNomeAnexo(''); }} className="text-orange-400 hover:text-orange-700"><IconClose /></button>
              </div>
            )}
          </div>
        </div>

        <div className="px-5 pb-3">
          <select value={empresaAlvo} onChange={e => setEmpresaAlvo(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 bg-gray-50 outline-none focus:border-orange-400">
            <option value="AMBAS">Todas as empresas</option>
            <option value="ENGEBAG">Engebag</option>
            <option value="BAG_CLEANER">Bag Cleaner</option>
          </select>
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-1">
            <label className={`p-2 rounded-full cursor-pointer transition-colors ${uploadingImg ? 'opacity-50 cursor-wait' : 'text-orange-500 hover:bg-orange-50'}`}>
              {uploadingImg ? <div className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" /> : <IconPhoto />}
              <input type="file" className="hidden" accept="image/*" disabled={uploadingImg}
                onChange={e => e.target.files?.[0] && uploadImagem(e.target.files[0])} />
            </label>
            <label className={`p-2 rounded-full cursor-pointer transition-colors ${uploadingAnexo ? 'opacity-50 cursor-wait' : 'text-orange-500 hover:bg-orange-50'}`}>
              {uploadingAnexo ? <div className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" /> : <IconAttach />}
              <input type="file" className="hidden" disabled={uploadingAnexo}
                onChange={e => e.target.files?.[0] && uploadAnexo(e.target.files[0])} />
            </label>
          </div>
          <button onClick={salvar} disabled={enviando || !conteudo.trim()}
            className="px-5 py-2 rounded-full text-sm font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: conteudo.trim() ? 'linear-gradient(135deg, #f97316, #ea580c)' : '#d1d5db' }}>
            {enviando ? 'Publicando...' : postEditando ? 'Salvar' : 'Publicar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Item de comentário (raiz ou resposta) ────────────────────────────────────
function ItemComentario({
  comentario, respostas, usuarioId, postId,
  usuarioFoto, usuarioNome, onExcluir, onNovaCriada,
}: {
  comentario: ComentarioResponse;
  respostas: ComentarioResponse[];
  usuarioId: number;
  postId: number;
  usuarioFoto?: string | null;
  usuarioNome: string;
  onExcluir: (id: number) => void;
  onNovaCriada: (novo: ComentarioResponse) => void;
}) {
  const [respondendo, setRespondendo] = useState(false);
  const [textoResposta, setTextoResposta] = useState('');
  const [enviando, setEnviando] = useState(false);

  const enviarResposta = async () => {
    if (!textoResposta.trim()) return;
    setEnviando(true);
    try {
      const novo = await postService.criarComentario(postId, textoResposta, comentario.id);
      onNovaCriada(novo);
      setTextoResposta('');
      setRespondendo(false);
    } finally { setEnviando(false); }
  };

  return (
    <div className="flex gap-2 group">
      <Avatar foto={comentario.fotoUsuario} nome={comentario.nomeUsuario} size="sm" />
      <div className="flex-1 min-w-0">
        {/* Balão do comentário */}
        <div className="bg-white rounded-xl px-3 py-2 text-sm border border-gray-100">
          <div className="flex items-center justify-between mb-0.5">
            <span className="font-semibold text-gray-800 text-xs">{comentario.nomeUsuario}</span>
            <div className="flex items-center gap-1.5">
              <span className="text-gray-400 text-xs">{dataRelativa(comentario.criadoEm)}</span>
              {comentario.idUsuario === usuarioId && (
                <button onClick={() => onExcluir(comentario.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all">
                  <IconTrash />
                </button>
              )}
            </div>
          </div>
          <p className="text-gray-700 leading-snug">{comentario.conteudo}</p>
        </div>

        {/* Ação: responder */}
        <button onClick={() => setRespondendo(v => !v)}
          className="flex items-center gap-1 mt-1 ml-1 text-xs text-gray-400 hover:text-orange-500 transition-colors">
          <IconReply />
          <span>Responder</span>
        </button>

        {/* Caixa de resposta */}
        {respondendo && (
          <div className="flex items-center gap-2 mt-2 bg-white border border-gray-200 rounded-full px-3 py-1.5 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
            <Avatar foto={usuarioFoto} nome={usuarioNome} size="sm" />
            <input
              autoFocus
              value={textoResposta}
              onChange={e => setTextoResposta(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviarResposta(); } }}
              placeholder={`Respondendo ${comentario.nomeUsuario}...`}
              className="flex-1 text-sm bg-transparent outline-none text-gray-800 placeholder-gray-400"
            />
            <button onClick={() => setRespondendo(false)} className="text-gray-300 hover:text-gray-500 transition-colors">
              <IconClose />
            </button>
            <button onClick={enviarResposta} disabled={enviando || !textoResposta.trim()}
              className="text-orange-500 hover:text-orange-600 disabled:opacity-40 font-semibold text-xs transition-colors">
              {enviando ? '...' : 'Enviar'}
            </button>
          </div>
        )}

        {/* Respostas aninhadas (1 nível) */}
        {respostas.length > 0 && (
          <div className="mt-2 ml-3 space-y-2 border-l-2 border-orange-100 pl-3">
            {respostas.map(r => (
              <div key={r.id} className="flex gap-2 group/resposta">
                <Avatar foto={r.fotoUsuario} nome={r.nomeUsuario} size="sm" />
                <div className="flex-1 bg-white rounded-xl px-3 py-2 text-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-semibold text-gray-800 text-xs">{r.nomeUsuario}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-400 text-xs">{dataRelativa(r.criadoEm)}</span>
                      {r.idUsuario === usuarioId && (
                        <button onClick={() => onExcluir(r.id)}
                          className="opacity-0 group-hover/resposta:opacity-100 text-gray-300 hover:text-red-500 transition-all">
                          <IconTrash />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-700 leading-snug">{r.conteudo}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Painel de comentários ────────────────────────────────────────────────────
function PainelComentarios({ postId, usuarioId, usuarioFoto, usuarioNome, onTotalChange }: {
  postId: number;
  usuarioId: number;
  usuarioFoto?: string | null;
  usuarioNome: string;
  /** Callback chamado quando o total de comentários muda (para atualizar o contador no card) */
  onTotalChange: (delta: number) => void;
}) {
  const [comentarios, setComentarios] = useState<ComentarioResponse[]>([]);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    postService.listarComentarios(postId)
      .then(setComentarios)
      .finally(() => setLoading(false));
  }, [postId]);

  // Separa raízes de respostas
  const raizes = comentarios.filter(c => !c.idPai);
  const respostasPor = (idPai: number) => comentarios.filter(c => c.idPai === idPai);

  const adicionarComentario = (novo: ComentarioResponse) => {
    setComentarios(prev => [...prev, novo]);
    onTotalChange(+1);
  };

  const excluirComentario = async (idComentario: number) => {
    // Conta quantos serão removidos (o comentário + suas respostas)
    const qtdRemovidos = comentarios.filter(
      c => c.id === idComentario || c.idPai === idComentario
    ).length;
    await postService.excluirComentario(postId, idComentario);
    setComentarios(prev => prev.filter(c => c.id !== idComentario && c.idPai !== idComentario));
    onTotalChange(-qtdRemovidos);
  };

  const enviarRaiz = async () => {
    if (!texto.trim()) return;
    setEnviando(true);
    try {
      const novo = await postService.criarComentario(postId, texto);
      adicionarComentario(novo);
      setTexto('');
    } finally { setEnviando(false); }
  };

  return (
    <div className="border-t border-gray-100 bg-gray-50/50">
      {/* Caixa de comentário raiz */}
      <div className="flex gap-2.5 px-4 pt-3 pb-2">
        <Avatar foto={usuarioFoto} nome={usuarioNome} size="sm" />
        <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-1.5 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
          <input value={texto} onChange={e => setTexto(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviarRaiz(); } }}
            placeholder="Adicionar comentário..."
            className="flex-1 text-sm bg-transparent outline-none text-gray-800 placeholder-gray-400" />
          <button onClick={enviarRaiz} disabled={enviando || !texto.trim()}
            className="text-orange-500 hover:text-orange-600 disabled:opacity-40 font-semibold text-xs transition-colors">
            {enviando ? '...' : 'Enviar'}
          </button>
        </div>
      </div>

      {/* Lista */}
      <div className="px-4 pb-3 space-y-3 max-h-72 overflow-y-auto">
        {loading && <p className="text-xs text-gray-400 text-center py-2">Carregando...</p>}
        {!loading && raizes.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-2">Seja o primeiro a comentar.</p>
        )}
        {raizes.map(c => (
          <ItemComentario
            key={c.id}
            comentario={c}
            respostas={respostasPor(c.id)}
            usuarioId={usuarioId}
            postId={postId}
            usuarioFoto={usuarioFoto}
            usuarioNome={usuarioNome}
            onExcluir={excluirComentario}
            onNovaCriada={adicionarComentario}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Card de Post ─────────────────────────────────────────────────────────────
function PostCard({
  post, usuarioId, usuarioRole, usuarioFoto, usuarioNome,
  onExcluir, onEditar, onToggleCurtir, onToggleFavoritar, onToggleFixar,
  onTotalComentariosChange,
}: {
  post: PostLocal;
  usuarioId: number;
  usuarioRole: string;
  usuarioFoto?: string | null;
  usuarioNome: string;
  onExcluir: (id: number) => void;
  onEditar: (post: PostLocal) => void;
  onToggleCurtir: (id: number) => void;
  onToggleFavoritar: (id: number) => void;
  onToggleFixar: (id: number) => void;
  /** FIX: callback para propagar mudança no contador de comentários ao estado pai */
  onTotalComentariosChange: (postId: number, delta: number) => void;
}) {
  const [comentariosAbertos, setComentariosAbertos] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isAdmin = usuarioRole === 'ADMIN';
  const isCriador = post.idCriador === usuarioId;
  const podeModenar = isAdmin || isCriador;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuAberto(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <article className={`bg-white rounded-2xl border transition-shadow hover:shadow-md ${post.fixado ? 'border-orange-200 ring-1 ring-orange-100' : 'border-gray-100 shadow-sm'}`}>

      {post.fixado && (
        <div className="flex items-center gap-1.5 px-4 pt-3 text-xs font-semibold text-orange-500">
          <IconPin /><span>Post fixado</span>
        </div>
      )}

      {/* Cabeçalho */}
      <div className="flex items-start justify-between px-4 pt-4 pb-3">
        <div className="flex items-start gap-3">
          <Avatar foto={post.fotoCriador} nome={post.nomeCriador} />
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight">{post.nomeCriador}</p>
            <p className="text-gray-400 text-xs">{post.cargoCriador}{post.setorCriador ? ` · ${post.setorCriador}` : ''}</p>
            <p className="text-gray-400 text-xs mt-0.5">
              {dataRelativa(post.dataCriacao)}
              {post.editadoEm && <span className="ml-1 italic">(editado)</span>}
            </p>
          </div>
        </div>

        {podeModenar && (
          <div className="relative" ref={menuRef}>
            <button onClick={() => setMenuAberto(v => !v)}
              className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
              <IconDotsH />
            </button>
            {menuAberto && (
              <div className="absolute right-0 top-8 z-20 bg-white rounded-xl shadow-xl border border-gray-100 py-1 min-w-[160px] overflow-hidden">
                <button onClick={() => { onEditar(post); setMenuAberto(false); }}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <IconEdit /><span>Editar post</span>
                </button>
                {isAdmin && (
                  <button onClick={() => { onToggleFixar(post.id); setMenuAberto(false); }}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <IconPin /><span>{post.fixado ? 'Desafixar' : 'Fixar no topo'}</span>
                  </button>
                )}
                <div className="border-t border-gray-100 my-1" />
                <button onClick={() => { onExcluir(post.id); setMenuAberto(false); }}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                  <IconTrash /><span>Excluir post</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="px-4 pb-3">
        {post.titulo && post.titulo !== post.conteudo?.slice(0, 60) && (
          <h3 className="font-bold text-gray-900 text-base mb-1">{post.titulo}</h3>
        )}
        <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{post.conteudo}</p>
      </div>

      {/* Imagem com carregamento lazy + skeleton */}
      {post.urlImagem && (
        <div className="mx-4 mb-3 rounded-xl overflow-hidden border border-gray-100">
          <LazyImage src={post.urlImagem} alt="imagem do post" className="w-full object-cover max-h-96" />
        </div>
      )}

      {/* Anexo */}
      {post.urlAnexo && (
        <div className="mx-4 mb-3">
          <a href={post.urlAnexo} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-xl px-3 py-2.5 text-sm text-orange-700 hover:bg-orange-100 transition-colors">
            <IconAttach />
            <span className="truncate flex-1 font-medium">{post.nomeAnexo || 'Ver anexo'}</span>
            <span className="text-orange-400 text-xs flex-shrink-0">Abrir →</span>
          </a>
        </div>
      )}

      {/* Barra de ações */}
      <div className="flex items-center gap-1 px-3 py-2.5 border-t border-gray-100">
        <button onClick={() => onToggleCurtir(post.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${post.euCurti ? 'text-red-500 bg-red-50 hover:bg-red-100' : 'text-gray-500 hover:bg-gray-100 hover:text-red-400'}`}>
          <IconHeart filled={post.euCurti} />
          <span>{post.totalCurtidas ?? 0}</span>
        </button>

        <button onClick={() => setComentariosAbertos(v => !v)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${comentariosAbertos ? 'text-blue-500 bg-blue-50' : 'text-gray-500 hover:bg-gray-100 hover:text-blue-400'}`}>
          <IconComment />
          {/* FIX: exibe o totalComentarios que vem do estado do pai (sempre atualizado) */}
          <span>{post.totalComentarios ?? 0}</span>
        </button>

        <button onClick={() => onToggleFavoritar(post.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ml-auto ${post.euFavoritei ? 'text-orange-500 bg-orange-50 hover:bg-orange-100' : 'text-gray-500 hover:bg-gray-100 hover:text-orange-400'}`}>
          <IconBookmark filled={post.euFavoritei} />
        </button>
      </div>

      {/* Comentários */}
      {comentariosAbertos && (
        <PainelComentarios
          postId={post.id}
          usuarioId={usuarioId}
          usuarioFoto={usuarioFoto}
          usuarioNome={usuarioNome}
          onTotalChange={(delta) => onTotalComentariosChange(post.id, delta)}
        />
      )}
    </article>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function VisaoGeral() {
  const [posts, setPosts] = useState<PostLocal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<'TODOS' | 'MEUS' | 'FAVORITOS'>('TODOS');
  const [modalAberto, setModalAberto] = useState(false);
  const [postEditando, setPostEditando] = useState<PostLocal | null>(null);
  const { usuario, fetchUsuarioLogado } = useAuthStore();

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await postService.listarFeed();
      setPosts(data as PostLocal[]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
    if (!usuario) fetchUsuarioLogado();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // FIX: remove imediatamente do estado local — sem aguardar um re-fetch
  const handleExcluir = async (id: number) => {
    if (!window.confirm('Deseja excluir este post?')) return;
    await postService.excluirAviso(id);
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  const handleToggleCurtir = async (id: number) => {
    // Optimistic update
    setPosts(prev => prev.map(p => p.id === id
      ? { ...p, euCurti: !p.euCurti, totalCurtidas: (p.totalCurtidas ?? 0) + (p.euCurti ? -1 : 1) }
      : p
    ));
    try {
      const res = await postService.toggleCurtir(id);
      setPosts(prev => prev.map(p => p.id === id ? { ...p, ...res } : p));
    } catch { carregar(); }
  };

  const handleToggleFavoritar = async (id: number) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, euFavoritei: !p.euFavoritei } : p));
    try { await postService.toggleFavoritar(id); }
    catch { carregar(); }
  };

  const handleToggleFixar = async (id: number) => {
    await postService.toggleFixar(id);
    carregar();
  };

  // FIX: atualiza o contador de comentários no estado pai quando PainelComentarios avisa
  const handleTotalComentariosChange = useCallback((postId: number, delta: number) => {
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, totalComentarios: Math.max(0, (p.totalComentarios ?? 0) + delta) }
        : p
    ));
  }, []);

  const fecharModal = () => { setModalAberto(false); setPostEditando(null); };

  const postsFiltrados = posts.filter(p => {
    if (filtro === 'MEUS') return p.idCriador === usuario?.id;
    if (filtro === 'FAVORITOS') return p.euFavoritei;
    return true;
  });

  const usuarioFoto: string | null = null;
  const usuarioNome = usuario?.nome ?? '';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Feed</h1>
            <p className="text-sm text-gray-500 mt-0.5">{posts.length} publicações</p>
          </div>
          <button onClick={() => { setPostEditando(null); setModalAberto(true); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white shadow-md hover:shadow-lg transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Criar post
          </button>
        </div>

        {/* Caixa rápida */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 mb-5 flex items-center gap-3 cursor-pointer hover:border-orange-200 transition-colors"
          onClick={() => { setPostEditando(null); setModalAberto(true); }}>
          <Avatar foto={usuarioFoto} nome={usuarioNome || 'U'} />
          <span className="text-gray-400 text-sm flex-1">O que está acontecendo?</span>
          <div className="flex items-center gap-2 text-orange-400"><IconPhoto /><IconAttach /></div>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-2 mb-5 bg-white border border-gray-100 rounded-2xl p-1.5 shadow-sm">
          {(['TODOS', 'MEUS', 'FAVORITOS'] as const).map(f => (
            <button key={f} onClick={() => setFiltro(f)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${filtro === f ? 'text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              style={filtro === f ? { background: 'linear-gradient(135deg, #f97316, #ea580c)' } : {}}>
              {f === 'TODOS' ? `Todos (${posts.length})` : f === 'MEUS' ? 'Meus posts' : '★ Salvos'}
            </button>
          ))}
        </div>

        {/* Feed */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                    <div className="h-2.5 bg-gray-100 rounded w-1/4" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-100 rounded" />
                  <div className="h-3 bg-gray-100 rounded w-4/5" />
                </div>
              </div>
            ))}
          </div>
        ) : postsFiltrados.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-gray-500 font-medium">
              {filtro === 'FAVORITOS' ? 'Nenhum post salvo ainda.' : 'Nenhum post encontrado.'}
            </p>
            {filtro === 'TODOS' && <p className="text-gray-400 text-sm mt-1">Seja o primeiro a publicar algo!</p>}
          </div>
        ) : (
          <div className="space-y-4">
            {postsFiltrados.map(post => (
              <PostCard
                key={post.id}
                post={post}
                usuarioId={usuario?.id ?? 0}
                usuarioRole={usuario?.role ?? 'USER'}
                usuarioFoto={usuarioFoto}
                usuarioNome={usuarioNome}
                onExcluir={handleExcluir}
                onEditar={(p) => { setPostEditando(p); setModalAberto(true); }}
                onToggleCurtir={handleToggleCurtir}
                onToggleFavoritar={handleToggleFavoritar}
                onToggleFixar={handleToggleFixar}
                onTotalComentariosChange={handleTotalComentariosChange}
              />
            ))}
          </div>
        )}
      </div>

      {modalAberto && (
        <ModalPost
          onClose={fecharModal}
          onSalvo={carregar}
          postEditando={postEditando}
          usuarioFoto={usuarioFoto}
          usuarioNome={usuarioNome}
        />
      )}
    </div>
  );
}