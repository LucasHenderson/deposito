import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map, catchError, of } from 'rxjs';
import { Notificacao } from '../models/notification.model';

const API_URL = 'http://localhost:8080/api/notificacoes';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private http = inject(HttpClient);
  private notificacoes = signal<Notificacao[]>([]);

  private intervalId: any = null;

  constructor() {
    this.iniciarPolling();
  }

  getNotificacoes() {
    return this.notificacoes.asReadonly();
  }

  notificacoesAtivas = computed(() => {
    const agora = new Date();
    return this.notificacoes().filter(n => !n.lida && new Date(n.dataAgendada) <= agora);
  });

  contadorNaoLidas = computed(() => {
    return this.notificacoesAtivas().length;
  });

  carregarNotificacoes(): void {
    this.http.get<Notificacao[]>(API_URL).subscribe({
      next: (data) => this.notificacoes.set(data),
      error: (err) => console.error('Erro ao carregar notificações:', err)
    });
  }

  adicionarNotificacao(dados: { vendaId: number; clienteNome: string; valorTotal: number; mensagem: string; dataAgendada: string }): Observable<Notificacao | null> {
    return this.http.post<Notificacao>(API_URL, dados).pipe(
      tap(nova => {
        this.notificacoes.update(list => [...list, nova]);
      }),
      catchError((err) => {
        console.error('Erro ao criar notificação:', err);
        return of(null);
      })
    );
  }

  marcarComoLida(id: number): void {
    this.http.patch<void>(`${API_URL}/${id}/lida`, {}).subscribe({
      next: () => {
        this.notificacoes.update(list =>
          list.map(n => n.id === id ? { ...n, lida: true } : n)
        );
      },
      error: (err) => console.error('Erro ao marcar notificação como lida:', err)
    });
  }

  marcarTodasComoLidas(): void {
    this.http.patch<void>(`${API_URL}/lidas`, {}).subscribe({
      next: () => {
        this.notificacoes.update(list =>
          list.map(n => ({ ...n, lida: true }))
        );
      },
      error: (err) => console.error('Erro ao marcar todas como lidas:', err)
    });
  }

  removerNotificacao(id: number): void {
    this.http.delete<void>(`${API_URL}/${id}`).subscribe({
      next: () => {
        this.notificacoes.update(list => list.filter(n => n.id !== id));
      },
      error: (err) => console.error('Erro ao remover notificação:', err)
    });
  }

  private iniciarPolling(): void {
    this.intervalId = setInterval(() => {
      this.carregarNotificacoes();
    }, 30000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
