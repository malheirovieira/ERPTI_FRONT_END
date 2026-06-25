import { Search, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import type { Ticket, TicketPrioridade } from '../types/ticket';

// --- Tipos -------------------------------------------------------------

export interface TicketFiltersValue {
  busca: string;
  categoria: string;
  prioridade: string;
  cliente: string;
  dataInicio: string;
  dataFim: string;
}

interface TicketFiltersProps {
  tickets: Ticket[];
  onFilterChange: (filtro: TicketFiltersValue, ticketsFiltrados: Ticket[]) => void;
}

const PRIORIDADES: TicketPrioridade[] = ['Baixa', 'Média', 'Alta', 'Crítica'];

// --- Componente ----------------------------------------------------------

export default function TicketFilters({ tickets, onFilterChange }: TicketFiltersProps) {
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('');
  const [prioridade, setPrioridade] = useState('');
  const [cliente, setCliente] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const categorias = Array.from(new Set(tickets.map((t) => t.categoria))).sort();
  const clientes = Array.from(new Set(tickets.map((t) => t.cliente))).sort();

  function aplicarFiltro(valores: TicketFiltersValue) {
    const filtrados = tickets.filter((t) => {
      const buscaOk =
        valores.busca.trim() === '' ||
        String(t.id).includes(valores.busca.trim()) ||
        t.titulo.toLowerCase().includes(valores.busca.trim().toLowerCase());
      
      const categoriaOk = valores.categoria === '' || t.categoria === valores.categoria;
      
      const prioridadeOk = 
        valores.prioridade === '' || 
        (t.prioridade?.toLowerCase() === valores.prioridade.toLowerCase());
      
      const clienteOk = valores.cliente === '' || t.cliente === valores.cliente;

      let dataOk = true;
      // Usando dataAbertura conforme identificado no seu objeto
      if (t.dataAbertura) {
        const dataTicket = new Date(t.dataAbertura).toISOString().split('T')[0];
        if (valores.dataInicio && dataTicket < valores.dataInicio) dataOk = false;
        if (valores.dataFim && dataTicket > valores.dataFim) dataOk = false;
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

  // --- Funções de atualização ---
  const atualizarBusca = (v: string) => { setBusca(v); disparar({ busca: v }); };
  const atualizarCategoria = (v: string) => { setCategoria(v); disparar({ categoria: v }); };
  const atualizarPrioridade = (v: string) => { setPrioridade(v); disparar({ prioridade: v }); };
  const atualizarCliente = (v: string) => { setCliente(v); disparar({ cliente: v }); };
  const atualizarDataInicio = (v: string) => { setDataInicio(v); disparar({ dataInicio: v }); };
  const atualizarDataFim = (v: string) => { setDataFim(v); disparar({ dataFim: v }); };

  function limparFiltros() {
    setBusca('');
    setCategoria('');
    setPrioridade('');
    setCliente('');
    setDataInicio('');
    setDataFim('');
    aplicarFiltro({
      busca: '', categoria: '', prioridade: '', cliente: '', dataInicio: '', dataFim: ''
    });
  }

  const temFiltroAtivo = busca !== '' || categoria !== '' || prioridade !== '' || cliente !== '' || dataInicio !== '' || dataFim !== '';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-55">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input
            type="text"
            value={busca}
            onChange={(e) => atualizarBusca(e.target.value)}
            placeholder="Buscar por ID ou título..."
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 outline-none focus:bg-white focus:border-[rgb(233,92,19)] focus:ring-2 focus:ring-orange-100"
          />
        </div>

        <FiltroSelect value={categoria} onChange={atualizarCategoria} placeholder="Categoria" options={categorias} />
        <FiltroSelect value={prioridade} onChange={atualizarPrioridade} placeholder="Prioridade" options={PRIORIDADES} />
        <FiltroSelect value={cliente} onChange={atualizarCliente} placeholder="Cliente" options={clientes} />

        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
          <span className="text-xs text-slate-400 font-medium">De</span>
          <input type="date" value={dataInicio} onChange={(e) => atualizarDataInicio(e.target.value)} className="text-sm bg-transparent outline-none w-30" />
          <span className="text-xs text-slate-400 font-medium">até</span>
          <input type="date" value={dataFim} onChange={(e) => atualizarDataFim(e.target.value)} className="text-sm bg-transparent outline-none w-30" />
        </div>

        {temFiltroAtivo && (
          <button onClick={limparFiltros} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-[rgb(233,92,19)] px-3 py-2.5 rounded-lg transition-colors hover:bg-orange-50">
            <X size={15} /> Limpar
          </button>
        )}
      </div>
    </div>
  );
}

function FiltroSelect({ value, onChange, placeholder, options }: { value: string; onChange: (v: string) => void; placeholder: string; options: string[] }) {
  const ativo = value !== '';
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)} className={`appearance-none pl-3 pr-8 py-2.5 text-sm rounded-lg border outline-none cursor-pointer min-w-35 ${ativo ? 'border-[rgb(233,92,19)] bg-orange-50 text-[rgb(233,92,19)]' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
        <option value="">{placeholder}</option>
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <ChevronDown size={14} className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${ativo ? 'text-[rgb(233,92,19)]' : 'text-slate-400'}`} />
    </div>
  );
}