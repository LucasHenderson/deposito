import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../services/cliente.service';
import { EnderecoService } from '../../services/endereco.service';
import { Cliente, ClienteFormData, HistoricoCompra } from '../../models/cliente.model';
import { Endereco } from '../../models/endereco.model';
import { AuthService } from '../../services/auth.service';
import { LogService } from '../../services/log.service';

type ModalType = 'create' | 'edit' | 'delete' | 'view' | 'historico' | null;
type SortOrder = 'nome-asc' | 'nome-desc' | 'recentes' | 'antigos' | 'sem-compras' | 'nenhum';

@Component({
  selector: 'app-clientes',
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes.html',
  styleUrl: './clientes.css',
})
export class Clientes {
  private clienteService = inject(ClienteService);
  private enderecoService = inject(EnderecoService);
  private authService = inject(AuthService);
  private logService = inject(LogService);

  isAdmin = this.authService.isAdmin;

  // Paginação
  currentPage = signal(1);
  itemsPerPage = signal(8);
  
  // Modal
  modalType = signal<ModalType>(null);
  selectedCliente = signal<Cliente | null>(null);
  
  // Formulário
  formData = signal<ClienteFormData>({
    nome: '',
    telefone: '',
    enderecosIds: [],
    dataCadastro: new Date(),
    observacoes: ''
  });

  // Busca e ordenação
  searchTerm = signal('');
  sortOrder = signal<SortOrder>('nenhum');

  // Texto copiado feedback
  textoCopiadoFeedback = signal(false);

  // Para modal de cadastro - texto gerado
  textoGerado = signal('');

  // Busca de endereços no modal (otimizada)
  enderecoSearchTerm = signal('');
  private enderecoSearchDebounceTimer: any = null;
  readonly MAX_DISPLAY_ITEMS = 50; // Limite de itens exibidos para performance

  // Modal de histórico
  historicoPage = signal(1);
  historicoItemsPerPage = signal(5);
  historicoDataInicio = signal<string>('');
  historicoDataFim = signal<string>('');

  // Computed
  clientes = this.clienteService.getClientes();
  enderecos = this.enderecoService.getEnderecos();
  totalClientes = computed(() => this.clienteService.getTotalClientes());

  // Endereços filtrados para o modal (com limite para performance)
  filteredEnderecosModal = computed(() => {
    const search = this.enderecoSearchTerm().toLowerCase().trim();
    const selectedIds = this.formData().enderecosIds;
    let list = this.enderecos();
    
    // Sempre mostrar os selecionados primeiro
    const selected = list.filter(e => selectedIds.includes(e.id));
    const notSelected = list.filter(e => !selectedIds.includes(e.id));
    
    // Aplicar busca apenas nos não selecionados
    let filteredNotSelected = notSelected;
    if (search) {
      filteredNotSelected = notSelected.filter(e => {
        const enderecoStr = this.getEnderecoFormatado(e).toLowerCase();
        return enderecoStr.includes(search);
      });
    }
    
    // Limitar quantidade para performance
    const limitedNotSelected = filteredNotSelected.slice(0, this.MAX_DISPLAY_ITEMS - selected.length);
    
    return {
      items: [...selected, ...limitedNotSelected],
      totalFiltered: filteredNotSelected.length,
      hasMore: filteredNotSelected.length > limitedNotSelected.length
    };
  });

  // Histórico filtrado por data
  filteredHistorico = computed(() => {
    const cliente = this.selectedCliente();
    if (!cliente) return [];
    
    let historico = this.clienteService.getHistoricoCompras(cliente.id);
    
    const dataInicio = this.historicoDataInicio();
    const dataFim = this.historicoDataFim();
    
    if (dataInicio) {
      const inicio = new Date(dataInicio);
      inicio.setHours(0, 0, 0, 0);
      historico = historico.filter(h => new Date(h.dataCompra) >= inicio);
    }
    
    if (dataFim) {
      const fim = new Date(dataFim);
      fim.setHours(23, 59, 59, 999);
      historico = historico.filter(h => new Date(h.dataCompra) <= fim);
    }
    
    return historico;
  });

  // Paginação do histórico
  historicoTotalPages = computed(() => 
    Math.ceil(this.filteredHistorico().length / this.historicoItemsPerPage())
  );

  paginatedHistorico = computed(() => {
    const start = (this.historicoPage() - 1) * this.historicoItemsPerPage();
    const end = start + this.historicoItemsPerPage();
    return this.filteredHistorico().slice(start, end);
  });

  historicoPages = computed(() => {
    const total = this.historicoTotalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  // Total gasto no período filtrado
  totalGastoFiltrado = computed(() => {
    return this.filteredHistorico().reduce((acc, h) => acc + h.valorTotal, 0);
  });

  filteredClientes = computed(() => {
    let list = this.clientes();
    
    // Busca por nome ou telefone
    const search = this.searchTerm().toLowerCase().trim();
    if (search) {
      list = list.filter(c => 
        c.nome.toLowerCase().includes(search) ||
        c.telefone.includes(search)
      );
    }
    
    // Ordenação
    const order = this.sortOrder();
    switch (order) {
      case 'nome-asc':
        list = [...list].sort((a, b) => a.nome.localeCompare(b.nome));
        break;
      case 'nome-desc':
        list = [...list].sort((a, b) => b.nome.localeCompare(a.nome));
        break;
      case 'recentes':
        list = [...list].sort((a, b) => 
          new Date(b.dataCadastro).getTime() - new Date(a.dataCadastro).getTime()
        );
        break;
      case 'antigos':
        list = [...list].sort((a, b) => 
          new Date(a.dataCadastro).getTime() - new Date(b.dataCadastro).getTime()
        );
        break;
      case 'sem-compras':
        list = this.clienteService.getClientesSemComprasRecentes()
          .filter(c => list.some(l => l.id === c.id));
        break;
    }
    
    return list;
  });

  totalPages = computed(() => 
    Math.ceil(this.filteredClientes().length / this.itemsPerPage())
  );

  paginatedClientes = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return this.filteredClientes().slice(start, end);
  });

  pages = computed(() => {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  // ===== AÇÕES DE MODAL =====
  
  openCreateModal() {
    this.resetForm();
    this.textoGerado.set('');
    this.modalType.set('create');
  }

  openEditModal(cliente: Cliente, event: Event) {
    event.stopPropagation();
    this.selectedCliente.set(cliente);
    this.formData.set({
      nome: cliente.nome,
      telefone: cliente.telefone,
      enderecosIds: [...cliente.enderecosIds],
      dataCadastro: cliente.dataCadastro,
      observacoes: cliente.observacoes
    });
    this.modalType.set('edit');
  }

  openDeleteModal(cliente: Cliente, event: Event) {
    event.stopPropagation();
    this.selectedCliente.set(cliente);
    this.modalType.set('delete');
  }

  openViewModal(cliente: Cliente) {
    this.selectedCliente.set(cliente);
    this.modalType.set('view');
  }

  openHistoricoModal() {
    this.historicoPage.set(1);
    this.historicoDataInicio.set('');
    this.historicoDataFim.set('');
    this.modalType.set('historico');
  }

  voltarParaDetalhes() {
    this.modalType.set('view');
  }

  closeModal() {
    this.modalType.set(null);
    this.selectedCliente.set(null);
    this.textoGerado.set('');
    this.resetForm();
  }

  // ===== ATUALIZAÇÃO DE CAMPOS =====

  updateNome(event: Event) {
    const input = event.target as HTMLInputElement;
    this.formData.update(data => ({ ...data, nome: input.value }));
  }

  updateTelefone(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 11) {
      value = value.slice(0, 11);
    }
    
    // Formata o telefone
    if (value.length > 6) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }
    
    this.formData.update(data => ({ ...data, telefone: value }));
  }

  updateObservacoes(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    this.formData.update(data => ({ ...data, observacoes: textarea.value }));
  }

  updateDataCadastro(event: Event) {
    const input = event.target as HTMLInputElement;
    this.formData.update(data => ({ ...data, dataCadastro: new Date(input.value) }));
  }

  toggleEndereco(enderecoId: string) {
    this.formData.update(data => {
      const enderecosIds = data.enderecosIds.includes(enderecoId)
        ? data.enderecosIds.filter(id => id !== enderecoId)
        : [...data.enderecosIds, enderecoId];
      return { ...data, enderecosIds };
    });
  }

  // Busca de endereços com debounce para performance
  updateEnderecoSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    
    // Limpa timer anterior
    if (this.enderecoSearchDebounceTimer) {
      clearTimeout(this.enderecoSearchDebounceTimer);
    }
    
    // Debounce de 300ms
    this.enderecoSearchDebounceTimer = setTimeout(() => {
      this.enderecoSearchTerm.set(value);
    }, 300);
  }

  clearEnderecoSearch() {
    this.enderecoSearchTerm.set('');
  }

  // ===== HISTÓRICO - FILTROS E PAGINAÇÃO =====

  updateHistoricoDataInicio(event: Event) {
    const input = event.target as HTMLInputElement;
    this.historicoDataInicio.set(input.value);
    this.historicoPage.set(1);
  }

  updateHistoricoDataFim(event: Event) {
    const input = event.target as HTMLInputElement;
    this.historicoDataFim.set(input.value);
    this.historicoPage.set(1);
  }

  clearHistoricoFiltros() {
    this.historicoDataInicio.set('');
    this.historicoDataFim.set('');
    this.historicoPage.set(1);
  }

  goToHistoricoPage(page: number) {
    if (page >= 1 && page <= this.historicoTotalPages()) {
      this.historicoPage.set(page);
    }
  }

  previousHistoricoPage() {
    if (this.historicoPage() > 1) {
      this.historicoPage.update(p => p - 1);
    }
  }

  nextHistoricoPage() {
    if (this.historicoPage() < this.historicoTotalPages()) {
      this.historicoPage.update(p => p + 1);
    }
  }

  // ===== AÇÕES CRUD =====

  handleSubmit() {
    const data = this.formData();
    const isEdit = this.modalType() === 'edit';
    
    const usuario = this.authService.usuarioLogado()?.usuario ?? 'desconhecido';

    if (isEdit) {
      const cliente = this.selectedCliente()!;
      const clienteId = cliente.id;
      const oldEnderecos = cliente.enderecosIds;

      const enderecosAntesFormatados = oldEnderecos.map(id => {
        const end = this.enderecoService.getEnderecoById(id);
        return end ? this.getEnderecoFormatado(end) : id;
      });
      const antes = `Nome: ${cliente.nome}\nTelefone: ${cliente.telefone}\nEndereços: ${enderecosAntesFormatados.length > 0 ? enderecosAntesFormatados.join(', ') : 'Nenhum'}\nObservações: ${cliente.observacoes || 'Nenhuma'}`;

      // Atualiza cliente
      this.clienteService.updateCliente(clienteId, data);

      // Atualiza vínculos nos endereços
      oldEnderecos.forEach(endId => {
        if (!data.enderecosIds.includes(endId)) {
          this.enderecoService.desvincularCliente(endId, clienteId);
        }
      });
      data.enderecosIds.forEach(endId => {
        if (!oldEnderecos.includes(endId)) {
          this.enderecoService.vincularCliente(endId, clienteId);
        }
      });

      const enderecosDepoisFormatados = data.enderecosIds.map(id => {
        const end = this.enderecoService.getEnderecoById(id);
        return end ? this.getEnderecoFormatado(end) : id;
      });
      const depois = `Nome: ${data.nome}\nTelefone: ${data.telefone}\nEndereços: ${enderecosDepoisFormatados.length > 0 ? enderecosDepoisFormatados.join(', ') : 'Nenhum'}\nObservações: ${data.observacoes || 'Nenhuma'}`;

      this.logService.registrar('editar', 'Clientes',
        `Cliente "${data.nome}" editado`,
        depois,
        usuario,
        antes
      );

      this.closeModal();
    } else {
      // Cria novo cliente
      const novoCliente = this.clienteService.createCliente(data);

      // Vincula aos endereços selecionados
      data.enderecosIds.forEach(endId => {
        this.enderecoService.vincularCliente(endId, novoCliente.id);
      });

      const enderecosFormatadosLog = data.enderecosIds.map(id => {
        const end = this.enderecoService.getEnderecoById(id);
        return end ? this.getEnderecoFormatado(end) : id;
      });
      this.logService.registrar('criar', 'Clientes',
        `Cliente "${novoCliente.nome}" criado`,
        `Nome: ${novoCliente.nome}\nTelefone: ${novoCliente.telefone}\nEndereços: ${enderecosFormatadosLog.length > 0 ? enderecosFormatadosLog.join(', ') : 'Nenhum'}\nObservações: ${novoCliente.observacoes || 'Nenhuma'}`,
        usuario
      );

      // Gera texto de cadastro
      const enderecosFormatados = this.getEnderecosFormatados(data.enderecosIds);
      const texto = this.clienteService.gerarTextoCadastro(novoCliente, enderecosFormatados);
      this.textoGerado.set(texto);
    }
  }

  confirmDelete() {
    const cliente = this.selectedCliente();
    if (cliente) {
      this.logService.registrar('excluir', 'Clientes',
        `Cliente "${cliente.nome}" excluído`,
        `ID: ${cliente.id}\nNome: ${cliente.nome}\nTelefone: ${cliente.telefone}`,
        this.authService.usuarioLogado()?.usuario ?? 'desconhecido'
      );

      // Remove vínculos dos endereços
      this.enderecoService.removerClienteDeTodosEnderecos(cliente.id);

      // Exclui cliente
      this.clienteService.deleteCliente(cliente.id);

      this.closeModal();
    }
  }

  // ===== HELPERS =====

  getEnderecosDoCliente(enderecosIds: string[]): Endereco[] {
    return this.enderecoService.getEnderecosByIds(enderecosIds);
  }

  getEnderecoFormatado(endereco: Endereco): string {
    return this.enderecoService.getEnderecoFormatado(endereco);
  }

  getEnderecosFormatados(enderecosIds: string[]): string[] {
    return enderecosIds.map(id => {
      const endereco = this.enderecoService.getEnderecoById(id);
      return endereco ? this.getEnderecoFormatado(endereco) : '';
    }).filter(e => e !== '');
  }

  getHistoricoCliente(): HistoricoCompra[] {
    const cliente = this.selectedCliente();
    if (!cliente) return [];
    return this.clienteService.getHistoricoCompras(cliente.id);
  }

  getUltimaCompra(clienteId: string): HistoricoCompra | undefined {
    return this.clienteService.getUltimaCompra(clienteId);
  }

  getWhatsAppLink(telefone: string): string {
    return this.clienteService.getWhatsAppLink(telefone);
  }

  getClientesVinculadosAoEndereco(enderecoId: string): Cliente[] {
    const endereco = this.enderecoService.getEnderecoById(enderecoId);
    if (!endereco) return [];
    return this.clienteService.getClientesByIds(endereco.clientesIds);
  }

  copiarTexto(texto: string) {
    navigator.clipboard.writeText(texto).then(() => {
      this.textoCopiadoFeedback.set(true);
      setTimeout(() => this.textoCopiadoFeedback.set(false), 2000);
    });
  }

  copiarResumoCliente() {
    const cliente = this.selectedCliente();
    if (!cliente) return;
    
    const enderecos = this.getEnderecosFormatados(cliente.enderecosIds);
    const historico = this.getHistoricoCliente();
    const texto = this.clienteService.gerarTextoResumo(cliente, enderecos, historico);
    
    this.copiarTexto(texto);
  }

  formatarData(data: Date): string {
    return new Date(data).toLocaleDateString('pt-BR');
  }

  getDateInputValue(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // ===== PAGINAÇÃO =====

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  previousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  // ===== BUSCA E FILTROS =====

  updateSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.currentPage.set(1);
  }

  clearSearch() {
    this.searchTerm.set('');
    this.currentPage.set(1);
  }

  changeSortOrder(order: SortOrder) {
    this.sortOrder.set(order);
    this.currentPage.set(1);
  }

  private resetForm() {
    this.formData.set({
      nome: '',
      telefone: '',
      enderecosIds: [],
      dataCadastro: new Date(),
      observacoes: ''
    });
    this.enderecoSearchTerm.set('');
  }
}