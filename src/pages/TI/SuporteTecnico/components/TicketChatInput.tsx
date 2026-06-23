import { useRef, useState } from 'react';
import { Paperclip, Send, X, FileText } from 'lucide-react';
import type { TicketAnexo, TicketChatMensagemInput } from '../types/ticket';

const LARANJA = 'rgb(233, 92, 19)';
const TAMANHO_MAXIMO_MB = 10;

interface TicketChatInputProps {
  /** Chamado ao enviar uma mensagem (texto + anexos já validados). */
  onSend: (mensagem: TicketChatMensagemInput) => void;
  placeholder?: string;
  /** Desabilita o input — útil enquanto a mensagem está sendo enviada para a API. */
  disabled?: boolean;
}

export default function TicketChatInput({
  onSend,
  placeholder = 'Escreva uma mensagem...',
  disabled = false,
}: TicketChatInputProps) {
  const [texto, setTexto] = useState('');
  const [anexos, setAnexos] = useState<TicketAnexo[]>([]);
  const [erro, setErro] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputArquivoRef = useRef<HTMLInputElement>(null);

  const podeEnviar = (texto.trim() !== '' || anexos.length > 0) && !disabled;

  function ajustarAltura(el: HTMLTextAreaElement) {
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }

  function atualizarTexto(valor: string) {
    setTexto(valor);
    if (textareaRef.current) ajustarAltura(textareaRef.current);
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
      setErro('');
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

  function enviar() {
    if (!podeEnviar) return;

    onSend({ texto: texto.trim(), anexos });

    setTexto('');
    setAnexos([]);
    setErro('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  }

  return (
    <div className="border border-slate-200 rounded-2xl bg-white px-4 py-3">
      {anexos.length > 0 && (
        <ul className="flex flex-wrap gap-2 mb-2">
          {anexos.map((anexo) => (
            <li
              key={anexo.nome}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            >
              <FileText size={13} className="text-slate-400 shrink-0" />
              <span className="text-slate-600 max-w-[140px] truncate">{anexo.nome}</span>
              <span className="text-slate-400 shrink-0">{formatarTamanho(anexo.tamanho)}</span>
              <button
                onClick={() => removerAnexo(anexo.nome)}
                className="text-slate-400 hover:text-red-500 transition-colors shrink-0"
              >
                <X size={13} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {erro && <div className="text-xs text-red-600 mb-2">{erro}</div>}

      <div className="flex items-end gap-2">
        {/* Botão Anexar alterado para rounded-full */}
        <button
          type="button"
          onClick={() => inputArquivoRef.current?.click()}
          disabled={disabled}
          className="shrink-0 p-2.5 rounded-full text-slate-400 hover:text-[rgb(233,92,19)] hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Anexar arquivo"
        >
          <Paperclip size={19} />
        </button>
        <input
          ref={inputArquivoRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => adicionarArquivos(e.target.files)}
        />

        <textarea
          ref={textareaRef}
          value={texto}
          onChange={(e) => atualizarTexto(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 outline-none focus:bg-white focus:border-[rgb(233,92,19)] focus:ring-2 focus:ring-orange-100 transition-colors disabled:opacity-50 max-h-40"
        />

        {/* Botão Enviar alterado para rounded-full */}
        <button
          type="button"
          onClick={enviar}
          disabled={!podeEnviar}
          className="shrink-0 p-2.5 rounded-full text-white transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: LARANJA }}
          title="Enviar mensagem"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}