// src/pages/TI/SuporteTecnico/components/UsuariosModal.tsx
import { useEffect, useMemo, useState } from 'react';
import { X, Search, UserX, UserCheck } from 'lucide-react';
import { useUsuariosStore } from '../store/useUsuariosStore';

interface UsuariosModalProps {
    aberto: boolean;
    onClose: () => void;
}

type FiltroStatus = 'TODOS' | 'ATIVO' | 'INATIVO';

interface AcaoPendente {
    id: number;
    nome: string;
    ativoAtual: boolean;
}

export default function UsuariosModal({ aberto, onClose }: UsuariosModalProps) {
    const { usuarios, loading, fetchUsuarios, alterarStatusUsuario } = useUsuariosStore();
    const [busca, setBusca] = useState('');
    const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('TODOS');
    const [acaoPendente, setAcaoPendente] = useState<AcaoPendente | null>(null);

    useEffect(() => {
        if (aberto) {
            fetchUsuarios();
        }
    }, [aberto, fetchUsuarios]);

    useEffect(() => {
        if (!aberto) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                if (acaoPendente) {
                    setAcaoPendente(null);
                } else {
                    onClose();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [aberto, onClose, acaoPendente]);

    const usuariosFiltrados = useMemo(() => {
        return usuarios
            .filter((usuario) => {
                if (filtroStatus === 'ATIVO') return usuario.ativo;
                if (filtroStatus === 'INATIVO') return !usuario.ativo;
                return true;
            })
            .filter((usuario) =>
                usuario.nome.toLowerCase().includes(busca.toLowerCase())
            )
            .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    }, [usuarios, filtroStatus, busca]);

    const handleAlterarStatus = (id: number, nome: string, ativoAtual: boolean) => {
        setAcaoPendente({ id, nome, ativoAtual });
    };

    const confirmarAlteracaoStatus = async () => {
        if (!acaoPendente) return;
        const sucesso = await alterarStatusUsuario(acaoPendente.id, !acaoPendente.ativoAtual);
        if (!sucesso) {
            window.alert('Não foi possível alterar o status do usuário. Tente novamente.');
        }
        setAcaoPendente(null);
    };

    if (!aberto) return null;

    return (
        <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Cabeçalho */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800">Usuários</h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Filtros */}
                <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nome..."
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-orange-400"
                        />
                    </div>

                    <select
                        value={filtroStatus}
                        onChange={(e) => setFiltroStatus(e.target.value as FiltroStatus)}
                        className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-orange-400 text-slate-700"
                    >
                        <option value="TODOS">Todos</option>
                        <option value="ATIVO">Ativo</option>
                        <option value="INATIVO">Inativo</option>
                    </select>
                </div>

                {/* Lista */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
                    {loading && (
                        <p className="text-sm text-slate-400 text-center py-8">Carregando usuários...</p>
                    )}

                    {!loading && usuariosFiltrados.length === 0 && (
                        <p className="text-sm text-slate-400 text-center py-8">Nenhum usuário encontrado.</p>
                    )}

                    {!loading && usuariosFiltrados.map((usuario) => (
                        <div
                            key={usuario.id}
                            className="flex items-center justify-between gap-4 p-3 border border-slate-100 rounded-lg hover:border-slate-200 transition-colors"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold text-slate-800 text-sm truncate">{usuario.nome}</p>
                                    <span
                                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                                            usuario.ativo
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-slate-200 text-slate-500'
                                        }`}
                                    >
                                        {usuario.ativo ? 'Ativo' : 'Inativo'}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 truncate">
                                    {usuario.email} {usuario.cargo ? `• ${usuario.cargo}` : ''}
                                </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={() => handleAlterarStatus(usuario.id, usuario.nome, usuario.ativo)}
                                    title={usuario.ativo ? 'Inativar' : 'Reativar'}
                                    className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                                >
                                    {usuario.ativo ? <UserX size={16} /> : <UserCheck size={16} />}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal de confirmação de inativar/reativar */}
            {acaoPendente && (
                <div
                    className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4"
                    onClick={() => setAcaoPendente(null)}
                >
                    <div
                        className="bg-white rounded-xl shadow-xl w-full max-w-sm"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-6 py-5">
                            <h3 className="text-base font-bold text-slate-800 mb-2">
                                {acaoPendente.ativoAtual ? 'Inativar usuário' : 'Reativar usuário'}
                            </h3>
                            <p className="text-sm text-slate-600">
                                Tem certeza que deseja {acaoPendente.ativoAtual ? 'inativar' : 'reativar'}{' '}
                                <span className="font-semibold">{acaoPendente.nome}</span>?
                            </p>
                        </div>
                        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100">
                            <button
                                onClick={() => setAcaoPendente(null)}
                                className="px-4 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                                Não
                            </button>
                            <button
                                onClick={confirmarAlteracaoStatus}
                                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                                    acaoPendente.ativoAtual
                                        ? 'bg-red-600 hover:bg-red-700'
                                        : 'bg-green-600 hover:bg-green-700'
                                }`}
                            >
                                Sim, {acaoPendente.ativoAtual ? 'inativar' : 'reativar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}