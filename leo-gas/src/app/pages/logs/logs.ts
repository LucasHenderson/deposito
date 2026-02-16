import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LogService } from '../../services/log.service';
import { LogEntry, LogAcao, LogModulo } from '../../models/log.model';

type SortOrder = 'recentes' | 'antigos';

@Component({
  selector: 'app-logs',
  imports: [CommonModule, FormsModule],
  templateUrl: './logs.html',
  styleUrl: './logs.css',
})
export class Logs implements OnInit {
  private logService = inject(LogService);

  ngOnInit() {
    this.logService.carregarLogs();
  }

  // Paginação
  currentPage = signal(1);
  itemsPerPage = 10;

  // Filtros
  filtroUsuario = signal('');
  filtroAcao = signal<LogAcao | ''>('');
  filtroModulo = signal<LogModulo | ''>('');
  filtroDataInicio = signal('');
  filtroDataFim = signal('');
  sortOrder = signal<SortOrder>('recentes');

  // Modal
  selectedLog = signal<LogEntry | null>(null);

  // Dados
  todosLogs = this.logService.todosLogs;

  logsFiltrados = computed(() => {
    let logs = this.todosLogs();

    const usuario = this.filtroUsuario();
    if (usuario) {
      logs = logs.filter(l => l.usuario === usuario);
    }

    const acao = this.filtroAcao();
    if (acao) {
      logs = logs.filter(l => l.acao === acao);
    }

    const modulo = this.filtroModulo();
    if (modulo) {
      logs = logs.filter(l => l.modulo === modulo);
    }

    const dataInicio = this.filtroDataInicio();
    if (dataInicio) {
      const inicio = new Date(dataInicio);
      inicio.setHours(0, 0, 0, 0);
      logs = logs.filter(l => new Date(l.data) >= inicio);
    }

    const dataFim = this.filtroDataFim();
    if (dataFim) {
      const fim = new Date(dataFim);
      fim.setHours(23, 59, 59, 999);
      logs = logs.filter(l => new Date(l.data) <= fim);
    }

    if (this.sortOrder() === 'antigos') {
      logs = [...logs].reverse();
    }

    return logs;
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.logsFiltrados().length / this.itemsPerPage)));

  logsPaginados = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return this.logsFiltrados().slice(start, start + this.itemsPerPage);
  });

  usuariosUnicos = computed(() => {
    const usuarios = new Set(this.todosLogs().map(l => l.usuario));
    return Array.from(usuarios);
  });

  // Ações
  updateFiltroUsuario(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.filtroUsuario.set(select.value);
    this.currentPage.set(1);
  }

  updateFiltroAcao(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.filtroAcao.set(select.value as LogAcao | '');
    this.currentPage.set(1);
  }

  updateFiltroModulo(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.filtroModulo.set(select.value as LogModulo | '');
    this.currentPage.set(1);
  }

  updateDataInicio(event: Event) {
    const input = event.target as HTMLInputElement;
    this.filtroDataInicio.set(input.value);
    this.currentPage.set(1);
  }

  updateDataFim(event: Event) {
    const input = event.target as HTMLInputElement;
    this.filtroDataFim.set(input.value);
    this.currentPage.set(1);
  }

  setSortOrder(order: SortOrder) {
    this.sortOrder.set(order);
    this.currentPage.set(1);
  }

  limparFiltros() {
    this.filtroUsuario.set('');
    this.filtroAcao.set('');
    this.filtroModulo.set('');
    this.filtroDataInicio.set('');
    this.filtroDataFim.set('');
    this.sortOrder.set('recentes');
    this.currentPage.set(1);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  previousPage() {
    this.goToPage(this.currentPage() - 1);
  }

  nextPage() {
    this.goToPage(this.currentPage() + 1);
  }

  getPages(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    let start = Math.max(1, current - 2);
    let end = Math.min(total, start + 4);
    start = Math.max(1, end - 4);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  openModal(log: LogEntry) {
    this.selectedLog.set(log);
  }

  closeModal() {
    this.selectedLog.set(null);
  }

  closeModalBackdrop(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeModal();
    }
  }

  formatarData(data: Date): string {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  formatarDataHora(data: Date): string {
    return new Date(data).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  getAcaoLabel(acao: LogAcao): string {
    const labels: Record<LogAcao, string> = {
      criar: 'Criação',
      editar: 'Edição',
      excluir: 'Exclusão',
      pendencia: 'Pendência',
    };
    return labels[acao];
  }

  getAcaoClass(acao: LogAcao): string {
    const classes: Record<LogAcao, string> = {
      criar: 'acao-criar',
      editar: 'acao-editar',
      excluir: 'acao-excluir',
      pendencia: 'acao-pendencia',
    };
    return classes[acao];
  }
}
