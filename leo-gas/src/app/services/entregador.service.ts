import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of, tap } from 'rxjs';
import { Entregador, EntregadorFormData } from '../models/entregador.model';

const API_URL = 'http://localhost:8080/api/entregadores';

@Injectable({ providedIn: 'root' })
export class EntregadorService {
  private http = inject(HttpClient);
  private entregadores = signal<Entregador[]>([]);

  getEntregadores() {
    return this.entregadores.asReadonly();
  }

  carregarEntregadores(): void {
    this.http.get<Entregador[]>(API_URL).subscribe({
      next: (list) => this.entregadores.set(list),
      error: () => this.entregadores.set([]),
    });
  }

  createEntregador(data: EntregadorFormData): Observable<boolean> {
    return this.http.post<Entregador>(API_URL, data).pipe(
      tap((novo) => this.entregadores.update((list) => [...list, novo])),
      map(() => true),
      catchError(() => of(false)),
    );
  }

  updateEntregador(id: number, data: EntregadorFormData): Observable<boolean> {
    return this.http.put<Entregador>(`${API_URL}/${id}`, data).pipe(
      tap((atualizado) =>
        this.entregadores.update((list) => list.map((e) => (e.id === id ? atualizado : e))),
      ),
      map(() => true),
      catchError(() => of(false)),
    );
  }

  toggleEntregadorStatus(id: number): Observable<boolean> {
    return this.http.patch<Entregador>(`${API_URL}/${id}/toggle-status`, {}).pipe(
      tap((atualizado) =>
        this.entregadores.update((list) => list.map((e) => (e.id === id ? atualizado : e))),
      ),
      map(() => true),
      catchError(() => of(false)),
    );
  }

  identificadorExists(identificador: string, excludeId?: number): Observable<boolean> {
    let url = `${API_URL}/identificador-existe?identificador=${encodeURIComponent(identificador)}`;
    if (excludeId) {
      url += `&excludeId=${excludeId}`;
    }
    return this.http.get<{ existe: boolean }>(url).pipe(
      map((res) => res.existe),
      catchError(() => of(false)),
    );
  }
}
