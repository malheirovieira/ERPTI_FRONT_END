import { API_URL, getAuthHeaders } from '../../../../services/api';
import type { Ticket } from '../types/ticket';

export async function listarChamados(): Promise<Ticket[]> {
    const response = await fetch(`${API_URL}/chamados`, {
        method: 'GET',
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        throw new Error('Erro ao buscar chamados');
    }

    const dados = await response.json();

    return dados.map((item: any): Ticket => ({
        id: item.id,
        titulo: item.titulo,
        descricao: item.descricao,
        categoria: item.categoria,
        prioridade: converterPrioridade(item.criticidade),
        cliente: formatarEmpresa(item.empresa),
        usuario: item.usuarioAbertura?.nome || 'Usuário',
        status: converterStatus(item.status),
        responsavel: item.responsavel?.nome,
        dataCriacao: item.dataCriacao,
        anexos: [],
    }));
}

function formatarEmpresa(empresa: string): string {
    switch (empresa) {
        case 'ENGEBAG':
            return 'EngeBag';

        case 'BAG_CLEANER':
            return 'Bag Cleaner';

        case 'IRAFLEX':
            return 'Iraflex';

        default:
            return empresa;
    }
}

function converterPrioridade(valor: string): any {
    switch (valor?.toUpperCase()) {
        case 'BAIXA':
            return 'Baixa';

        case 'MEDIA':
        case 'MÉDIA':
            return 'Média';

        case 'ALTA':
            return 'Alta';

        case 'CRITICA':
        case 'CRÍTICA':
            return 'Crítica';

        default:
            return 'Baixa';
    }
}

function converterStatus(status: string): any {
    switch (status?.toUpperCase()) {
        case 'ABERTO':
            return 'Aberto';

        case 'EM_ANDAMENTO':
            return 'Em andamento';

        case 'AGUARDANDO_CLIENTE':
            return 'Aguardando cliente';

        case 'RESOLVIDO':
            return 'Resolvido';

        case 'FECHADO':
            return 'Fechado';

        default:
            return 'Aberto';
    }
}