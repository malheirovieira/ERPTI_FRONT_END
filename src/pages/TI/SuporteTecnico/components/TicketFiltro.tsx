import { Search, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import type { Ticket, TicketPrioridade } from '../types/ticket';

// --- Tipos -------------------------------------------------------------

export interface TicketFiltersValue {
  busca: string;
  categoria: string; // '' = todas
  prioridade: string; // '' = todas
  cliente: string; // '' = todos
  dataInicio: string; // formato yyyy-mm-dd, '' = sem limite
  dataFim: string; // formato yyyy-mm-dd, '' = sem limite
}

interface TicketFiltersProps {
  /** Lista completa de tickets — usada apenas para montar as opções de Categoria e Cliente automaticamente. */
  tickets: Ticket[];
  /** Chamado sempre que o filtro mudar, já com a lista filtrada calculada. */
  onFilterChange: (filtro: TicketFiltersValue, ticketsFiltrados: Ticket[]) => void;
}

const PRIORIDADES: TicketPrioridade[] = ['Baixa', 'Média', 'Alta', 'Crítica'];

const LARANJA = 'rgb(233, 92, 19)';

// --- Componente ----------------------------------------------------------

export default function TicketFilters({ tickets, onFilterChange }: TicketFiltersProps) {
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('');
  const [prioridade, setPrioridade] = useState('');
  const [cliente, setCliente] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  // Opções derivadas direto dos tickets reais — sem hardcode, sempre em sincronia com os dados.
  const categorias = Array.from(new Set(tickets.map((t) => t.categoria))).sort();
  const clientes = Array.from(new Set(tickets.map((t) => t.cliente))).sort();

  function aplicarFiltro(valores: TicketFiltersValue) {
    const filtrados = tickets.filter((t) => {
      const buscaOk =
        valores.busca.trim() === '' ||
        String(t.id).includes(valores.busca.trim()) ||
        t.titulo.toLowerCase().includes(valores.busca.trim().toLowerCase());
      const categoriaOk = valores.categoria === '' || t.categoria === valores.categoria;
      const prioridadeOk = valores.prioridade === '' || t.prioridade === valores.prioridade;
      const clienteOk = valores.cliente === '' || t.cliente === valores.cliente;

      let dataOk = true;
      if (t.dataCriacao) {
        if (valores.dataInicio && t.dataCriacao < valores.dataInicio) dataOk = false;
        if (valores.dataFim && t.dataCriacao > valores.dataFim) dataOk = false;
      }

      return buscaOk && categoriaOk && prioridadeOk && clienteOk && dataOk;
    });

    onFilterChange(valores, filtrados);
  }

  function disparar(novosValores: Partial<TicketFiltersValue>) {
    const valores: TicketFiltersValue = {
      busca,
      categoria,
      prioridade,
      cliente,
      dataInicio,
      dataFim,
      ...novosValores,
    };
    aplicarFiltro(valores);
  }

  function atualizarBusca(valor: string) {
    setBusca(valor);
    disparar({ busca: valor });
  }

  function atualizarCategoria(valor: string) {
    setCategoria(valor);
    disparar({ categoria: valor });
  }

  function atualizarPrioridade(valor: string) {
    setPrioridade(valor);
    disparar({ prioridade: valor });
  }

  function atualizarCliente(valor: string) {
    setCliente(valor);
    disparar({ cliente: valor });
  }

  function atualizarDataInicio(valor: string) {
    setDataInicio(valor);
    disparar({ dataInicio: valor });
  }

  function atualizarDataFim(valor: string) {
    setDataFim(valor);
    disparar({ dataFim: valor });
  }

  function limparFiltros() {
    setBusca('');
    setCategoria('');
    setPrioridade('');
    setCliente('');
    setDataInicio('');
    setDataFim('');
    aplicarFiltro({
      busca: '',
      categoria: '',
      prioridade: '',
      cliente: '',
      dataInicio: '',
      dataFim: '',
    });
  }

  const temFiltroAtivo =
    busca !== '' || categoria !== '' || prioridade !== '' || cliente !== '' || dataInicio !== '' || dataFim !== '';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="flex flex-wrap gap-3 items-center">
        {/* Busca */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input
            type="text"
            value={busca}
            onChange={(e) => atualizarBusca(e.target.value)}
            placeholder="Buscar por ID ou título..."
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 placeholder:text-slate-400 outline-none transition-colors focus:bg-white focus:border-[rgb(233,92,19)] focus:ring-2 focus:ring-orange-100"
          />
        </div>

        <FiltroSelect
          value={categoria}
          onChange={atualizarCategoria}
          placeholder="Categoria"
          options={categorias}
        />

        <FiltroSelect
          value={prioridade}
          onChange={atualizarPrioridade}
          placeholder="Prioridade"
          options={PRIORIDADES}
        />

        <FiltroSelect value={cliente} onChange={atualizarCliente} placeholder="Cliente" options={clientes} />

        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
          <span className="text-xs text-slate-400 font-medium">De</span>
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => atualizarDataInicio(e.target.value)}
            className="text-sm text-slate-700 bg-transparent outline-none w-[120px]"
          />
          <span className="text-xs text-slate-400 font-medium">até</span>
          <input
            type="date"
            value={dataFim}
            onChange={(e) => atualizarDataFim(e.target.value)}
            className="text-sm text-slate-700 bg-transparent outline-none w-[120px]"
          />
        </div>

        {temFiltroAtivo && (
          <button
            onClick={limparFiltros}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-[rgb(233,92,19)] px-3 py-2.5 rounded-lg transition-colors hover:bg-orange-50"
          >
            <X size={15} />
            Limpar
          </button>
        )}
      </div>
    </div>
  );
}

// --- Subcomponente: select estilizado -----------------------------------

function FiltroSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (valor: string) => void;
  placeholder: string;
  options: string[];
}) {
  const ativo = value !== '';

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none pl-3 pr-8 py-2.5 text-sm rounded-lg border outline-none transition-colors cursor-pointer min-w-[140px]
          ${ativo
            ? 'border-[rgb(233,92,19)] bg-orange-50 text-[rgb(233,92,19)] font-medium'
            : 'border-slate-200 bg-slate-50 text-slate-600'
          }
          focus:ring-2 focus:ring-orange-100`}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${
          ativo ? 'text-[rgb(233,92,19)]' : 'text-slate-400'
        }`}
      />
    </div>
  );
}
