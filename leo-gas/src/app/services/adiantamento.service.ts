import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of, tap } from 'rxjs';
import { Adiantamento, AdiantamentoFormData } from '../models/adiantamento.model';

const API_URL = 'http://localhost:8080/api/adiantamentos';

@Injectable({
  providedIn: 'root'
})
export class AdiantamentoService {
  private http = inject(HttpClient);
  private adiantamentos = signal<Adiantamento[]>([]);

  getAdiantamentos() {
    return this.adiantamentos.asReadonly();
  }

  carregarAdiantamentos(): void {
    this.http.get<Adiantamento[]>(API_URL).subscribe({
      next: (list) => this.adiantamentos.set(list),
      error: () => this.adiantamentos.set([]),
    });
  }

  createAdiantamento(entregadorId: string | number, data: AdiantamentoFormData): Observable<boolean> {
    const payload = {
      entregadorId: Number(entregadorId),
      descricao: data.descricao,
      data: this.formatDate(data.data),
      valor: data.valor,
    };
    return this.http.post<Adiantamento>(API_URL, payload).pipe(
      tap((novo) => this.adiantamentos.update((list) => [...list, novo])),
      map(() => true),
      catchError(() => of(false)),
    );
  }

  updateAdiantamento(id: number, entregadorId: string | number, data: AdiantamentoFormData): Observable<boolean> {
    const payload = {
      entregadorId: Number(entregadorId),
      descricao: data.descricao,
      data: this.formatDate(data.data),
      valor: data.valor,
    };
    return this.http.put<Adiantamento>(`${API_URL}/${id}`, payload).pipe(
      tap((atualizado) =>
        this.adiantamentos.update((list) => list.map((a) => (a.id === id ? atualizado : a))),
      ),
      map(() => true),
      catchError(() => of(false)),
    );
  }

  deleteAdiantamento(id: number): Observable<boolean> {
    return this.http.delete(`${API_URL}/${id}`).pipe(
      tap(() => this.adiantamentos.update((list) => list.filter((a) => a.id !== id))),
      map(() => true),
      catchError(() => of(false)),
    );
  }

  private formatDate(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
