import { Injectable, signal, computed } from '@angular/core';
import { LogEntry, LogAcao, LogModulo } from '../models/log.model';

const STORAGE_KEY = 'leogas_logs';

@Injectable({ providedIn: 'root' })
export class LogService {
  private logs = signal<LogEntry[]>(this.carregarLogs());

  todosLogs = computed(() =>
    this.logs().sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
  );

  registrar(acao: LogAcao, modulo: LogModulo, resumo: string, detalhes: string, usuario: string, detalhesAntes?: string): void {
    const novoLog: LogEntry = {
      id: crypto.randomUUID(),
      acao,
      modulo,
      resumo,
      detalhes,
      detalhesAntes,
      usuario,
      data: new Date(),
    };

    this.logs.update((atual) => [novoLog, ...atual]);
    this.salvar();
  }

  private salvar(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.logs()));
  }

  private carregarLogs(): LogEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data) as LogEntry[];
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    return [];
  }
}
