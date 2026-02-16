import { Injectable, signal } from '@angular/core';
import { Produto, ProdutoFormData, RegistroVenda, PrecoPorPagamento } from '../models/produto.model';

@Injectable({
  providedIn: 'root'
})
export class ProdutoService {
  private produtos = signal<Produto[]>([
    {
      id: '1',
      nome: 'Gás de Cozinha P13 - Troca',
      precos: {
        credito: 145.00,
        debito: 140.00,
        dinheiro: 140.00,
        pix: 140.00
      },
      vinculos: [
        { variavelEstoqueId: '1', tipoInteracao: 'nao-altera' }
      ]
    },
    {
      id: '2',
      nome: 'Gás de Cozinha P13 - Completo',
      precos: {
        credito: 350.00,
        debito: 350.00,
        dinheiro: 350.00,
        pix: 350.00
      },
      vinculos: [
        { variavelEstoqueId: '1', tipoInteracao: 'reduz' }
      ]
    },
    {
      id: '3',
      nome: 'Água Mineral 20L - Troca',
      precos: {
        credito: 17.00,
        debito: 17.00,
        dinheiro: 17.00,
        pix: 17.00
      },
      vinculos: [
        { variavelEstoqueId: '2', tipoInteracao: 'nao-altera' }
      ]
    },
    {
      id: '4',
      nome: 'Água Mineral 20L - Completo',
      precos: {
        credito: 47.00,
        debito: 47.00,
        dinheiro: 47.00,
        pix: 47.00
      },
      vinculos: [
        { variavelEstoqueId: '2', tipoInteracao: 'reduz' }
      ]
    },
    {
      id: '5',
      nome: 'Registro Regulador - Com Mangueira',
      precos: {
        credito: 100.00,
        debito: 100.00,
        dinheiro: 90.00,
        pix: 90.00
      },
      vinculos: [
        { variavelEstoqueId: '3', tipoInteracao: 'reduz' }
      ]
    },
    {
      id: '6',
      nome: 'Gás P13 + Brinde (Isqueiro)',
      precos: {
        credito: 150.00,
        debito: 145.00,
        dinheiro: 145.00,
        pix: 145.00
      },
      vinculos: [
        { variavelEstoqueId: '1', tipoInteracao: 'nao-altera' },
        { variavelEstoqueId: '4', tipoInteracao: 'reduz' }
      ]
    }
  ]);

  // Registros de vendas (simulação - será gerenciado pela página de vendas futuramente)
  private vendas = signal<RegistroVenda[]>([
    // Vendas de exemplo para demonstração
    { id: '1', produtoId: '1', quantidade: 15, dataVenda: new Date('2025-01-15'), formaPagamento: 'pix', valorTotal: 2100 },
    { id: '2', produtoId: '1', quantidade: 20, dataVenda: new Date('2025-01-20'), formaPagamento: 'dinheiro', valorTotal: 2800 },
    { id: '3', produtoId: '2', quantidade: 5, dataVenda: new Date('2025-01-25'), formaPagamento: 'credito', valorTotal: 1750 },
    { id: '4', produtoId: '3', quantidade: 30, dataVenda: new Date('2025-01-18'), formaPagamento: 'pix', valorTotal: 510 },
    { id: '5', produtoId: '4', quantidade: 10, dataVenda: new Date('2025-01-22'), formaPagamento: 'debito', valorTotal: 470 },
    { id: '6', produtoId: '5', quantidade: 3, dataVenda: new Date('2025-01-28'), formaPagamento: 'dinheiro', valorTotal: 270 },
    { id: '7', produtoId: '1', quantidade: 25, dataVenda: new Date('2025-02-01'), formaPagamento: 'pix', valorTotal: 3500 },
    { id: '8', produtoId: '2', quantidade: 8, dataVenda: new Date('2025-02-02'), formaPagamento: 'credito', valorTotal: 2800 },
    { id: '9', produtoId: '6', quantidade: 12, dataVenda: new Date('2025-02-03'), formaPagamento: 'pix', valorTotal: 1740 },
    { id: '10', produtoId: '3', quantidade: 45, dataVenda: new Date('2025-02-04'), formaPagamento: 'dinheiro', valorTotal: 765 },
  ]);

  getProdutos() {
    return this.produtos.asReadonly();
  }

  getVendas() {
    return this.vendas.asReadonly();
  }

  // Calcula o total de vendas de um produto em um período
  getTotalVendasPorPeriodo(produtoId: string, dataInicio: Date | null, dataFim: Date | null): number {
    let vendasFiltradas = this.vendas().filter(v => v.produtoId === produtoId);
    
    if (dataInicio) {
      const inicio = new Date(dataInicio);
      inicio.setHours(0, 0, 0, 0);
      vendasFiltradas = vendasFiltradas.filter(v => new Date(v.dataVenda) >= inicio);
    }
    
    if (dataFim) {
      const fim = new Date(dataFim);
      fim.setHours(23, 59, 59, 999);
      vendasFiltradas = vendasFiltradas.filter(v => new Date(v.dataVenda) <= fim);
    }
    
    return vendasFiltradas.reduce((total, venda) => total + venda.quantidade, 0);
  }

  // Retorna todos os totais de vendas por produto no período
  getTodosVendasPorPeriodo(dataInicio: Date | null, dataFim: Date | null): Map<string, number> {
    const totais = new Map<string, number>();
    
    this.produtos().forEach(produto => {
      totais.set(produto.id, this.getTotalVendasPorPeriodo(produto.id, dataInicio, dataFim));
    });
    
    return totais;
  }

  createProduto(data: ProdutoFormData): boolean {
    if (data.vinculos.length === 0) {
      return false; // Produto deve ter pelo menos 1 vínculo
    }

    const newProduto: Produto = {
      id: this.generateId(),
      nome: data.nome,
      precos: data.precos,
      vinculos: data.vinculos
    };

    this.produtos.update(list => [...list, newProduto]);
    return true;
  }

  updateProduto(id: string, data: ProdutoFormData): boolean {
    if (data.vinculos.length === 0) {
      return false; // Produto deve ter pelo menos 1 vínculo
    }

    this.produtos.update(list =>
      list.map(p => p.id === id ? { ...p, ...data } : p)
    );
    return true;
  }

  deleteProduto(id: string): void {
    this.produtos.update(list => list.filter(p => p.id !== id));
  }

  // ===== MÉTODO ATUALIZADO: Registra uma venda com ID rastreável =====
  registrarVenda(
    produtoId: string, 
    quantidade: number, 
    formaPagamento: keyof PrecoPorPagamento, 
    valorTotal?: number,
    vendaId?: string  // Novo parâmetro para rastreamento
  ): string {
    const produto = this.produtos().find(p => p.id === produtoId);
    if (!produto) return '';

    // Se valorTotal não foi fornecido, calcula usando o preço do produto
    const valor = valorTotal !== undefined 
      ? valorTotal 
      : produto.precos[formaPagamento] * quantidade;

    // Gera ID: se vendaId fornecido, usa como prefixo para permitir rastreamento
    const registroId = vendaId 
      ? `${vendaId}_reg_${produtoId}_${Date.now()}`
      : this.generateId();

    const novaVenda: RegistroVenda = {
      id: registroId,
      produtoId,
      quantidade,
      dataVenda: new Date(),
      formaPagamento: formaPagamento,
      valorTotal: valor
    };

    this.vendas.update(list => [...list, novaVenda]);
    return novaVenda.id;
  }

  // Remove uma venda registrada (usado ao excluir venda)
  removerVenda(vendaId: string): boolean {
    const vendaExiste = this.vendas().some(v => v.id === vendaId);
    if (!vendaExiste) return false;

    this.vendas.update(list => list.filter(v => v.id !== vendaId));
    return true;
  }

  // Remove todas as vendas registradas relacionadas a uma venda específica
  removerVendasPorPrefixo(prefixo: string): number {
    let removidos = 0;
    this.vendas.update(list => {
      const novaLista = list.filter(v => {
        const shouldRemove = v.id.startsWith(prefixo);
        if (shouldRemove) removidos++;
        return !shouldRemove;
      });
      return novaLista;
    });
    return removidos;
  }
  // ==========================================================================

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}