import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap, catchError, of, throwError } from 'rxjs';
import { Venda, VendaFormData, StatusVenda } from '../models/venda.model';

const API_URL = 'http://localhost:8080/api/vendas';

@Injectable({
  providedIn: 'root'
})
export class VendaService {
  private http = inject(HttpClient);
  private vendas = signal<Venda[]>([]);

  getVendas() {
    return this.vendas.asReadonly();
  }

  carregarVendas(): void {
    this.http.get<Venda[]>(API_URL).subscribe({
      next: (data) => this.vendas.set(data),
      error: (err) => console.error('Erro ao carregar vendas:', err)
    });
  }

  getVendaById(id: number): Venda | undefined {
    return this.vendas().find(v => v.id === id);
  }

  getTotalVendas(): number {
    return this.vendas().length;
  }

  createVenda(data: VendaFormData): Observable<Venda> {
    const request = {
      clienteId: data.clienteId,
      enderecoId: data.enderecoId,
      entregadorId: data.entregadorId,
      itens: data.itens.map(item => ({
        produtoId: item.produtoId,
        quantidade: item.quantidade,
        precoUnitario: item.precoUnitario,
        subtotal: item.subtotal
      })),
      pagamentos: data.pagamentos.map(pag => ({
        forma: pag.forma,
        valor: pag.valor
      })),
      observacoes: data.observacoes
    };

    return this.http.post<Venda>(API_URL, request).pipe(
      tap(nova => {
        this.vendas.update(list => [nova, ...list]);
      }),
      catchError((err) => {
        const mensagem = err.error?.erro || 'Erro ao criar venda.';
        return throwError(() => new Error(mensagem));
      })
    );
  }

  updateVenda(id: number, data: VendaFormData): Observable<boolean> {
    const request = {
      clienteId: data.clienteId,
      enderecoId: data.enderecoId,
      entregadorId: data.entregadorId,
      itens: data.itens.map(item => ({
        produtoId: item.produtoId,
        quantidade: item.quantidade,
        precoUnitario: item.precoUnitario,
        subtotal: item.subtotal
      })),
      pagamentos: data.pagamentos.map(pag => ({
        forma: pag.forma,
        valor: pag.valor
      })),
      observacoes: data.observacoes
    };

    return this.http.put<Venda>(`${API_URL}/${id}`, request).pipe(
      tap(atualizada => {
        this.vendas.update(list =>
          list.map(v => v.id === id ? atualizada : v)
        );
      }),
      map(() => true),
      catchError((err) => {
        const mensagem = err.error?.erro || 'Erro ao atualizar venda.';
        return throwError(() => new Error(mensagem));
      })
    );
  }

  deleteVenda(id: number): Observable<boolean> {
    return this.http.delete<void>(`${API_URL}/${id}`).pipe(
      tap(() => {
        this.vendas.update(list => list.filter(v => v.id !== id));
      }),
      map(() => true),
      catchError((err) => {
        console.error('Erro ao deletar venda:', err);
        return of(false);
      })
    );
  }

  updateStatus(id: number, status: StatusVenda): Observable<boolean> {
    return this.http.patch<Venda>(`${API_URL}/${id}/status`, { status }).pipe(
      tap(atualizada => {
        this.vendas.update(list =>
          list.map(v => v.id === id ? atualizada : v)
        );
      }),
      map(() => true),
      catchError((err) => {
        console.error('Erro ao atualizar status:', err);
        return of(false);
      })
    );
  }

  toggleRecebimentoPendente(id: number): Observable<boolean> {
    return this.http.patch<Venda>(`${API_URL}/${id}/recebimento-pendente`, {}).pipe(
      tap(atualizada => {
        this.vendas.update(list =>
          list.map(v => v.id === id ? atualizada : v)
        );
      }),
      map(() => true),
      catchError((err) => {
        console.error('Erro ao toggle recebimento pendente:', err);
        return of(false);
      })
    );
  }

  buscarVendasPorQuadra(quadra: string, inicio: string, fim: string): Observable<{ data: string; total: number }[]> {
    return this.http.get<{ data: string; total: number }[]>(
      `${API_URL}/contagem-por-quadra`, { params: { quadra, inicio, fim } }
    );
  }

  // Estatísticas locais computadas sobre o signal
  getTotalVendasHoje(): number {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    return this.vendas().filter(v => {
      const dataVenda = new Date(v.dataVenda);
      dataVenda.setHours(0, 0, 0, 0);
      return dataVenda.getTime() === hoje.getTime();
    }).length;
  }

  getValorTotalVendasHoje(): number {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    return this.vendas()
      .filter(v => {
        const dataVenda = new Date(v.dataVenda);
        dataVenda.setHours(0, 0, 0, 0);
        return dataVenda.getTime() === hoje.getTime();
      })
      .reduce((total, venda) => total + venda.valorTotal, 0);
  }

  getVendasPorStatus(status: StatusVenda): Venda[] {
    return this.vendas().filter(v => v.status === status);
  }

  getVendasComRecebimentoPendente(): Venda[] {
    return this.vendas().filter(v => v.recebimentoPendente);
  }
}
