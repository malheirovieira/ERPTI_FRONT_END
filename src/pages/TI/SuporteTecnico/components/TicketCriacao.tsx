import { useState, useRef } from 'react';
import { X, FileText, Trash2, Plus, Loader2 } from 'lucide-react';
import type { NovoChamadoInput, TicketAnexo, TicketPrioridade } from '../types/ticket';
import { API_URL, getAuthHeaders } from '../../../../services/api';

const LARANJA = 'rgb(233, 92, 19)';

const PRIORIDADES: TicketPrioridade[] = ['Baixa', 'Média', 'Alta', 'Crítica'];

const EMPRESAS = ['EngeBag', 'Bag Cleaner', 'Iraflex'];

const CATEGORIAS = [
  'Infraestrutura',
  'RM',
  'E-mail',
  'Telefone',
  'Computador',
  'Impressora',
  'Rede',
  'Acessos',
  'Segurança',
  'Programas',
];

interface NovoChamadoModalProps {
  aberto: boolean;
  onClose: () => void;
  onSubmit: (chamadoId: number) => void;
  usuarioLogado: string;
}

const TAMANHO_MAXIMO_MB = 10;

export default function NovoChamadoModal({
  aberto,
  onClose,
  onSubmit,
  usuarioLogado,
}: NovoChamadoModalProps) {
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState('');
  const [prioridade, setPrioridade] = useState<TicketPrioridade | ''>('');
  const [cliente, setCliente] = useState('');
  const [descricao, setDescricao] = useState('');
  const [anexos, setAnexos] = useState<TicketAnexo[]>([]);
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const inputArquivoRef = useRef<HTMLInputElement>(null);

  if (!aberto) return null;

  function limparFormulario() {
    setTitulo('');
    setCategoria('');
    setPrioridade('');
    setCliente('');
    setDescricao('');
    setAnexos([]);
    setErro('');
  }

  function fechar() {
    if (enviando) return; // Impede o fechamento durante o envio
    limparFormulario();
    onClose();
  }

  function adicionarArquivos(arquivos: FileList | null) {
    if (!arquivos) return;
    const novos: TicketAnexo[] = [];

    for (const arquivo of Array.from(arquivos)) {
      if (arquivo.size > TAMANHO_MAXIMO_MB * 1024 * 1024) {
        setErro(`"${arquivo.name}" excede o limite de ${TAMANHO_MAXIMO_MB}MB.`);
        continue;
      }
      novos.push({ nome: arquivo.name, tamanho: arquivo.size, tipo: arquivo.type, arquivo });
    }

    if (novos.length > 0) {
      setAnexos((atual) => [...atual, ...novos]);
    }
  }

  function removerAnexo(nome: string) {
    setAnexos((atual) => atual.filter((a) => a.nome !== nome));
  }

  function formatarTamanho(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  async function handleSubmit() {
    if (!titulo.trim() || !categoria || !prioridade || !cliente || !descricao.trim()) {
      setErro('Preencha todos os campos obrigatórios antes de enviar.');
      return;
    }

    setEnviando(true);
    setErro('');

    // Ajusta a nomenclatura e formatação da empresa para salvar adequadamente no banco de dados 
    const empresaFormatada = cliente.replace(/\s+/g, '_').toUpperCase(); // "EngeBag" -> "ENGEBAG", "Bag Cleaner" -> "BAG_CLEANER"

    const bodyChamado = {
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      categoria,
      criticidade: prioridade.toUpperCase(), // Converte para o padrão de criticidade da tabela do banco de dados 
      empresa: empresaFormatada
    };

    try {
      const response = await fetch(`${API_URL}/chamados`, {
        method: 'POST',
        headers: getAuthHeaders(), // Injeta dinamicamente o Token Bearer [cite: 227]
        body: JSON.stringify(bodyChamado),
      });

      if (!response.ok) {
        // Trata respostas de erro de negócio enviadas pela API (Ex: sem permissão na empresa) [cite: 237, 238]
        const textoErro = await response.text();
        throw new Error(textoErro || 'Ocorreu um erro ao registrar o chamado.');
      }

      // Tratamento da resposta de sucesso do backend (Ex: "Chamado criado com sucesso! ID: 2") [cite: 235, 236]
      const respostaSucesso = await response.text();
      
      // Captura o ID gerado usando expressão regular
      const idCorrespondente = respostaSucesso.match(/ID:\s*(\d+)/);
      const chamadoId = idCorrespondente ? parseInt(idCorrespondente[1], 10) : 0;

      // Se houver lógica de upload de arquivos implementada futuramente, rodaria aqui utilizando o chamadoId.

      onSubmit(chamadoId);
      limparFormulario();
      onClose();
    } catch (err: any) {
      console.error("Erro ao registrar chamado:", err);
      setErro(err.message || 'Falha na conexão com o servidor.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={fechar}
    >
      <div
        className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-xl">
          <h2 className="text-lg font-bold text-slate-800">Abrir novo chamado</h2>
          <button
            onClick={fechar}
            disabled={enviando}
            className="text-slate-400 hover:text-slate-600 transition-colors rounded-lg p-1 hover:bg-slate-100 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Formulário */}
        <div className="px-6 py-5 space-y-4">
          <Campo label="Título" obrigatorio>
            <input
              type="text"
              value={titulo}
              disabled={enviando}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Resuma o problema em poucas palavras"
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 outline-none focus:bg-white focus:border-[rgb(233,92,19)] focus:ring-2 focus:ring-orange-100 transition-colors disabled:opacity-70"
            />
          </Campo>

          <div className="grid grid-cols-2 gap-4">
            <Campo label="Categoria" obrigatorio>
              <select
                value={categoria}
                disabled={enviando}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 outline-none focus:bg-white focus:border-[rgb(233,92,19)] focus:ring-2 focus:ring-orange-100 transition-colors disabled:opacity-70"
              >
                <option value="">Selecione</option>
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Campo>

            <Campo label="Prioridade" obrigatorio>
              <select
                value={prioridade}
                disabled={enviando}
                onChange={(e) => setPrioridade(e.target.value as TicketPrioridade)}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 outline-none focus:bg-white focus:border-[rgb(233,92,19)] focus:ring-2 focus:ring-orange-100 transition-colors disabled:opacity-70"
              >
                <option value="">Selecione</option>
                {PRIORIDADES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </Campo>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Campo label="Empresa" obrigatorio>
              <select
                value={cliente}
                disabled={enviando}
                onChange={(e) => setCliente(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 outline-none focus:bg-white focus:border-[rgb(233,92,19)] focus:ring-2 focus:ring-orange-100 transition-colors disabled:opacity-70"
              >
                <option value="">Selecione</option>
                {EMPRESAS.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </Campo>

            <Campo label="Usuário">
              <input
                type="text"
                value={usuarioLogado}
                disabled
                readOnly
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-100 text-slate-500 outline-none cursor-not-allowed"
              />
            </Campo>
          </div>

          <Campo label="Descrição" obrigatorio>
            <textarea
              value={descricao}
              disabled={enviando}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva o problema com o máximo de detalhes possível"
              rows={4}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 outline-none focus:bg-white focus:border-[rgb(233,92,19)] focus:ring-2 focus:ring-orange-100 transition-colors resize-none disabled:opacity-70"
            />
          </Campo>

          <Campo label="Anexos">
            <button
              type="button"
              disabled={enviando}
              onClick={() => inputArquivoRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 px-3 py-3 text-sm text-slate-500 border border-dashed border-slate-300 rounded-lg hover:border-[rgb(233,92,19)] hover:text-[rgb(233,92,19)] hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={16} />
              Adicionar arquivo
            </button>
            <input
              ref={inputArquivoRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => adicionarArquivos(e.target.files)}
            />

            {anexos.length > 0 && (
              <ul className="mt-2 space-y-1.5">
                {anexos.map((anexo) => (
                  <li
                    key={anexo.nome}
                    className="flex items-center justify-between gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  >
                    <span className="flex items-center gap-2 text-slate-600 truncate">
                      <FileText size={15} className="text-slate-400 shrink-0" />
                      <span className="truncate">{anexo.nome}</span>
                      <span className="text-slate-400 text-xs shrink-0">{formatarTamanho(anexo.tamanho)}</span>
                    </span>
                    <button
                      type="button"
                      disabled={enviando}
                      onClick={() => removerAnexo(anexo.nome)}
                      className="text-slate-400 hover:text-red-500 transition-colors shrink-0 disabled:opacity-50"
                    >
                      <Trash2 size={15} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Campo>

          {erro && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 whitespace-pre-line">
              {erro}
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100">
          <button
            type="button"
            onClick={fechar}
            disabled={enviando}
            className="px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={enviando}
            className="px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-all hover:opacity-90 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            style={{ backgroundColor: LARANJA }}
          >
            {enviando && <Loader2 size={16} className="animate-spin" />}
            {enviando ? 'Abrindo...' : 'Abrir chamado'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Campo({
  label,
  obrigatorio,
  children,
}: {
  label: string;
  obrigatorio?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
        {label} {obrigatorio && <span style={{ color: LARANJA }}>*</span>}
      </label>
      {children}
    </div>
  );
}