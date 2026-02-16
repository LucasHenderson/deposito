import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LogEntry, LogAcao, LogModulo } from '../models/log.model';

const API_URL = 'http://localhost:8080/api/logs';

@Injectable({ providedIn: 'root' })
export class LogService {
  private http = inject(HttpClient);
  private logs = signal<LogEntry[]>([]);

  todosLogs = computed(() =>
    this.logs().sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()),
  );

  carregarLogs(): void {
    this.http.get<LogEntry[]>(API_URL).subscribe({
      next: (logs) => this.logs.set(logs),
      error: () => this.logs.set([]),
    });
  }

  registrar(
    acao: LogAcao,
    modulo: LogModulo,
    resumo: string,
    detalhes: string,
    usuario: string,
    detalhesAntes?: string,
  ): void {
    const body = { acao, modulo, resumo, detalhes, detalhesAntes, usuario };

    this.http.post<LogEntry>(API_URL, body).subscribe({
      next: (novoLog) => {
        this.logs.update((atual) => [novoLog, ...atual]);
      },
    });
  }
}
