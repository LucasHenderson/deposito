import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap, catchError, of } from 'rxjs';
import { Produto, ProdutoFormData, RegistroVenda, PrecoPorPagamento } from '../models/produto.model';

const API_URL = 'http://localhost:8080/api/produtos';

// Interface para o formato de resposta do backend
interface ProdutoBackend {
  id: number;
  nome: string;
  precoCredito: number;
  precoDebito: number;
  precoDinheiro: number;
  precoPix: number;
  vinculos: { variavelEstoqueId: number; tipoInteracao: string }[];
}

// Interface para o formato de request do backend
interface ProdutoBackendRequest {
  nome: string;
  precoCredito: number;
  precoDebito: number;
  precoDinheiro: number;
  precoPix: number;
  vinculos: { variavelEstoqueId: number; tipoInteracao: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class ProdutoService {
  private http = inject(HttpClient);
  private produtos = signal<Produto[]>([]);

  // Registros de vendas (será migrado quando a página de Vendas for conectada ao backend)
  private vendas = signal<RegistroVenda[]>([]);

  getProdutos() {
    return this.produtos.asReadonly();
  }

  getVendas() {
    return this.vendas.asReadonly();
  }

  carregarProdutos(): void {
    this.http.get<ProdutoBackend[]>(API_URL).subscribe(data => {
      this.produtos.set(data.map(p => this.fromBackend(p)));
    });
  }

  // Calcula o total de vendas de um produto em um período
  getTotalVendasPorPeriodo(produtoId: string | number, dataInicio: Date | null, dataFim: Date | null): number {
    const pid = String(produtoId);
    let vendasFiltradas = this.vendas().filter(v => v.produtoId === pid);

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
      totais.set(String(produto.id), this.getTotalVendasPorPeriodo(produto.id, dataInicio, dataFim));
    });

    return totais;
  }

  createProduto(data: ProdutoFormData): Observable<boolean> {
    const request = this.toBackendRequest(data);
    return this.http.post<ProdutoBackend>(API_URL, request).pipe(
      tap(novo => {
        this.produtos.update(list => [...list, this.fromBackend(novo)]);
      }),
      map(() => true),
      catchError(() => of(false))
    );
  }

  updateProduto(id: number, data: ProdutoFormData): Observable<boolean> {
    const request = this.toBackendRequest(data);
    return this.http.put<ProdutoBackend>(`${API_URL}/${id}`, request).pipe(
      tap(atualizado => {
        this.produtos.update(list =>
          list.map(p => p.id === id ? this.fromBackend(atualizado) : p)
        );
      }),
      map(() => true),
      catchError(() => of(false))
    );
  }

  deleteProduto(id: number): Observable<boolean> {
    return this.http.delete<void>(`${API_URL}/${id}`).pipe(
      tap(() => {
        this.produtos.update(list => list.filter(p => p.id !== id));
      }),
      map(() => true),
      catchError(() => of(false))
    );
  }

  // Registra uma venda com ID rastreável (será migrado com a página de Vendas)
  registrarVenda(
    produtoId: string | number,
    quantidade: number,
    formaPagamento: keyof PrecoPorPagamento,
    valorTotal?: number,
    vendaId?: string
  ): string {
    const pid = String(produtoId);
    const produto = this.produtos().find(p => String(p.id) === pid);
    if (!produto) return '';

    const valor = valorTotal !== undefined
      ? valorTotal
      : produto.precos[formaPagamento] * quantidade;

    const registroId = vendaId
      ? `${vendaId}_reg_${pid}_${Date.now()}`
      : this.generateId();

    const novaVenda: RegistroVenda = {
      id: registroId,
      produtoId: pid,
      quantidade,
      dataVenda: new Date(),
      formaPagamento: formaPagamento,
      valorTotal: valor
    };

    this.vendas.update(list => [...list, novaVenda]);
    return novaVenda.id;
  }

  // Remove uma venda registrada
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

  // Converte resposta do backend para o formato do frontend
  private fromBackend(p: ProdutoBackend): Produto {
    return {
      id: p.id,
      nome: p.nome,
      precos: {
        credito: p.precoCredito,
        debito: p.precoDebito,
        dinheiro: p.precoDinheiro,
        pix: p.precoPix
      },
      vinculos: p.vinculos.map(v => ({
        variavelEstoqueId: v.variavelEstoqueId,
        tipoInteracao: v.tipoInteracao as 'reduz' | 'nao-altera' | 'aumenta'
      }))
    };
  }

  // Converte dados do formulário para o formato do backend
  private toBackendRequest(data: ProdutoFormData): ProdutoBackendRequest {
    return {
      nome: data.nome,
      precoCredito: data.precos.credito,
      precoDebito: data.precos.debito,
      precoDinheiro: data.precos.dinheiro,
      precoPix: data.precos.pix,
      vinculos: data.vinculos.map(v => ({
        variavelEstoqueId: v.variavelEstoqueId,
        tipoInteracao: v.tipoInteracao
      }))
    };
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}
