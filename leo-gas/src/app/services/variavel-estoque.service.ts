import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap, catchError, of } from 'rxjs';
import { VariavelEstoque, VariavelEstoqueFormData, AjusteEstoque } from '../models/variavel-estoque.model';

const API_URL = 'http://localhost:8080/api/variaveis-estoque';

@Injectable({
  providedIn: 'root'
})
export class VariavelEstoqueService {
  private http = inject(HttpClient);
  private variaveis = signal<VariavelEstoque[]>([]);
  private todasVariaveis = signal<VariavelEstoque[]>([]);
  private ajustes = signal<AjusteEstoque[]>([]);

  getVariaveis() {
    return this.variaveis.asReadonly();
  }

  getTodasVariaveis() {
    return this.todasVariaveis.asReadonly();
  }

  getAjustes() {
    return this.ajustes.asReadonly();
  }

  carregarVariaveis(): void {
    this.http.get<VariavelEstoque[]>(API_URL).subscribe(data => {
      this.variaveis.set(data);
    });
    this.http.get<VariavelEstoque[]>(`${API_URL}/todas`).subscribe(data => {
      this.todasVariaveis.set(data);
    });
    this.http.get<AjusteEstoque[]>(`${API_URL}/ajustes`).subscribe(data => {
      this.ajustes.set(data);
    });
  }

  getVariavelById(id: number | string): VariavelEstoque | undefined {
    return this.variaveis().find(v => v.id === Number(id));
  }

  createVariavel(data: VariavelEstoqueFormData): Observable<boolean> {
    return this.http.post<VariavelEstoque>(API_URL, data).pipe(
      tap(nova => {
        this.variaveis.update(list => [...list, nova]);
      }),
      map(() => true),
      catchError(() => of(false))
    );
  }

  updateVariavel(id: number, data: VariavelEstoqueFormData): Observable<boolean> {
    return this.http.put<VariavelEstoque>(`${API_URL}/${id}`, data).pipe(
      tap(atualizada => {
        this.variaveis.update(list =>
          list.map(v => v.id === id ? atualizada : v)
        );
      }),
      map(() => true),
      catchError(() => of(false))
    );
  }

  deleteVariavel(id: number): Observable<boolean> {
    return this.http.delete<void>(`${API_URL}/${id}`).pipe(
      tap(() => {
        this.variaveis.update(list => list.filter(v => v.id !== id));
      }),
      map(() => true),
      catchError(() => of(false))
    );
  }

  // Método para reduzir estoque quando uma venda é realizada
  reduzirEstoque(id: number | string, quantidade: number): boolean {
    const varId = Number(id);
    const variavel = this.variaveis().find(v => v.id === varId);
    if (!variavel || variavel.quantidade < quantidade) {
      return false;
    }

    this.variaveis.update(list =>
      list.map(v => v.id === varId ? { ...v, quantidade: v.quantidade - quantidade } : v)
    );
    return true;
  }

  // Método para aumentar estoque
  aumentarEstoque(id: number | string, quantidade: number): void {
    const varId = Number(id);
    this.variaveis.update(list =>
      list.map(v => v.id === varId ? { ...v, quantidade: v.quantidade + quantidade } : v)
    );
  }
}
