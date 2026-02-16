import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EnderecoService } from '../../services/endereco.service';
import { ClienteService } from '../../services/cliente.service';
import { Endereco, EnderecoFormData, QuadraResumo } from '../../models/endereco.model';
import { Cliente } from '../../models/cliente.model';
import { AuthService } from '../../services/auth.service';
import { LogService } from '../../services/log.service';

type ModalType = 'create' | 'edit' | 'delete' | null;
type SortOrder = 'quadra-asc' | 'quadra-desc' | 'mais-clientes' | 'menos-clientes' | 'nenhum';

@Component({
  selector: 'app-enderecos',
  imports: [CommonModule, FormsModule],
  templateUrl: './enderecos.html',
  styleUrl: './enderecos.css',
})
export class Enderecos {
  private enderecoService = inject(EnderecoService);
  private clienteService = inject(ClienteService);
  private authService = inject(AuthService);
  private logService = inject(LogService);

  isAdmin = this.authService.isAdmin;

  // Paginação - Endereços
  currentPage = signal(1);
  itemsPerPage = signal(8);
  
  // Paginação - Quadras
  quadrasPage = signal(1);
  quadrasPerPage = signal(5);
  
  // Modal
  modalType = signal<ModalType>(null);
  selectedEndereco = signal<Endereco | null>(null);
  
  // Formulário
  formData = signal<EnderecoFormData>({
    quadra: '',
    alameda: '',
    qi: '',
    lote: '',
    casa: '',
    complemento: '',
    clientesIds: []
  });

  // Busca e ordenação
  searchTerm = signal('');
  sortOrder = signal<SortOrder>('nenhum');

  // Busca de clientes no modal (otimizada)
  clienteSearchTerm = signal('');
  private clienteSearchDebounceTimer: any = null;
  readonly MAX_DISPLAY_ITEMS = 50; // Limite de itens exibidos para performance

  // Computed
  enderecos = this.enderecoService.getEnderecos();
  clientes = this.clienteService.getClientes();
  
  quadrasResumo = computed(() => this.enderecoService.getQuadrasResumo());
  
  totalEnderecos = computed(() => this.enderecos().length);

  // Clientes filtrados para o modal (com limite para performance)
  filteredClientesModal = computed(() => {
    const search = this.clienteSearchTerm().toLowerCase().trim();
    const selectedIds = this.formData().clientesIds;
    let list = this.clientes();
    
    // Sempre mostrar os selecionados primeiro
    const selected = list.filter(c => selectedIds.includes(c.id));
    const notSelected = list.filter(c => !selectedIds.includes(c.id));
    
    // Aplicar busca apenas nos não selecionados
    let filteredNotSelected = notSelected;
    if (search) {
      filteredNotSelected = notSelected.filter(c => {
        const nomeMatch = c.nome.toLowerCase().includes(search);
        const telefoneMatch = c.telefone.includes(search);
        return nomeMatch || telefoneMatch;
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

  filteredEnderecos = computed(() => {
    let list = this.enderecos();
    
    // Busca
    const search = this.searchTerm().toLowerCase().trim();
    if (search) {
      list = list.filter(e => 
        e.quadra.toLowerCase().includes(search) ||
        e.alameda.toLowerCase().includes(search) ||
        e.lote.toLowerCase().includes(search) ||
        e.complemento.toLowerCase().includes(search) ||
        e.qi.toLowerCase().includes(search)
      );
    }
    
    // Ordenação
    const order = this.sortOrder();
    switch (order) {
      case 'quadra-asc':
        list = [...list].sort((a, b) => a.quadra.localeCompare(b.quadra));
        break;
      case 'quadra-desc':
        list = [...list].sort((a, b) => b.quadra.localeCompare(a.quadra));
        break;
      case 'mais-clientes':
        list = [...list].sort((a, b) => b.clientesIds.length - a.clientesIds.length);
        break;
      case 'menos-clientes':
        list = [...list].sort((a, b) => a.clientesIds.length - b.clientesIds.length);
        break;
    }
    
    return list;
  });

  // Paginação - Endereços
  totalPages = computed(() => 
    Math.ceil(this.filteredEnderecos().length / this.itemsPerPage())
  );

  paginatedEnderecos = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return this.filteredEnderecos().slice(start, end);
  });

  pages = computed(() => {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  // Paginação - Quadras
  totalQuadrasPages = computed(() => 
    Math.ceil(this.quadrasResumo().length / this.quadrasPerPage())
  );

  paginatedQuadras = computed(() => {
    const start = (this.quadrasPage() - 1) * this.quadrasPerPage();
    const end = start + this.quadrasPerPage();
    return this.quadrasResumo().slice(start, end);
  });

  quadrasPages = computed(() => {
    const total = this.totalQuadrasPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  // ===== AÇÕES DE MODAL =====
  
  openCreateModal() {
    this.resetForm();
    this.modalType.set('create');
  }

  openEditModal(endereco: Endereco, event: Event) {
    event.stopPropagation();
    this.selectedEndereco.set(endereco);
    this.formData.set({
      quadra: endereco.quadra,
      alameda: endereco.alameda,
      qi: endereco.qi,
      lote: endereco.lote,
      casa: endereco.casa,
      complemento: endereco.complemento,
      clientesIds: [...endereco.clientesIds]
    });
    this.modalType.set('edit');
  }

  openDeleteModal(endereco: Endereco, event: Event) {
    event.stopPropagation();
    this.selectedEndereco.set(endereco);
    this.modalType.set('delete');
  }

  closeModal() {
    this.modalType.set(null);
    this.selectedEndereco.set(null);
    this.resetForm();
  }

  // ===== ATUALIZAÇÃO DE CAMPOS =====

  updateQuadra(event: Event) {
    const input = event.target as HTMLInputElement;
    this.formData.update(data => ({ ...data, quadra: input.value }));
  }

  updateAlameda(event: Event) {
    const input = event.target as HTMLInputElement;
    this.formData.update(data => ({ ...data, alameda: input.value }));
  }

  updateQi(event: Event) {
    const input = event.target as HTMLInputElement;
    this.formData.update(data => ({ ...data, qi: input.value }));
  }

  updateLote(event: Event) {
    const input = event.target as HTMLInputElement;
    this.formData.update(data => ({ ...data, lote: input.value }));
  }

  updateCasa(event: Event) {
    const input = event.target as HTMLInputElement;
    this.formData.update(data => ({ ...data, casa: input.value }));
  }

  updateComplemento(event: Event) {
    const input = event.target as HTMLInputElement;
    this.formData.update(data => ({ ...data, complemento: input.value }));
  }

  toggleCliente(clienteId: string) {
    this.formData.update(data => {
      const clientesIds = data.clientesIds.includes(clienteId)
        ? data.clientesIds.filter(id => id !== clienteId)
        : [...data.clientesIds, clienteId];
      return { ...data, clientesIds };
    });
  }

  // Busca de clientes com debounce para performance
  updateClienteSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    
    // Limpa timer anterior
    if (this.clienteSearchDebounceTimer) {
      clearTimeout(this.clienteSearchDebounceTimer);
    }
    
    // Debounce de 300ms
    this.clienteSearchDebounceTimer = setTimeout(() => {
      this.clienteSearchTerm.set(value);
    }, 300);
  }

  clearClienteSearch() {
    this.clienteSearchTerm.set('');
  }

  // ===== AÇÕES CRUD =====

  handleSubmit() {
    const data = this.formData();
    const isEdit = this.modalType() === 'edit';
    
    const usuario = this.authService.usuarioLogado()?.usuario ?? 'desconhecido';
    const enderecoLabel = `QD ${data.quadra} AL ${data.alameda} LT ${data.lote}${data.casa ? ' CS ' + data.casa : ''}`;

    if (isEdit) {
      const endereco = this.selectedEndereco()!;
      const enderecoId = endereco.id;
      const oldClientes = endereco.clientesIds;

      const clientesAntesNomes = oldClientes.map(id => {
        const cli = this.clienteService.getClienteById(id);
        return cli ? cli.nome : id;
      });
      const antes = `Quadra: ${endereco.quadra}\nAlameda: ${endereco.alameda}\nQI: ${endereco.qi}\nLote: ${endereco.lote}\nCasa: ${endereco.casa || '-'}\nComplemento: ${endereco.complemento || '-'}\nClientes: ${clientesAntesNomes.length > 0 ? clientesAntesNomes.join(', ') : 'Nenhum'}`;

      // Atualiza endereço
      this.enderecoService.updateEndereco(enderecoId, data);

      // Atualiza vínculos nos clientes
      oldClientes.forEach(cliId => {
        if (!data.clientesIds.includes(cliId)) {
          this.clienteService.desvincularEndereco(cliId, enderecoId);
        }
      });
      data.clientesIds.forEach(cliId => {
        if (!oldClientes.includes(cliId)) {
          this.clienteService.vincularEndereco(cliId, enderecoId);
        }
      });

      const clientesDepoisNomes = data.clientesIds.map(id => {
        const cli = this.clienteService.getClienteById(id);
        return cli ? cli.nome : id;
      });
      const depois = `Quadra: ${data.quadra}\nAlameda: ${data.alameda}\nQI: ${data.qi}\nLote: ${data.lote}\nCasa: ${data.casa || '-'}\nComplemento: ${data.complemento || '-'}\nClientes: ${clientesDepoisNomes.length > 0 ? clientesDepoisNomes.join(', ') : 'Nenhum'}`;

      this.logService.registrar('editar', 'Endereços',
        `Endereço "${enderecoLabel}" editado`,
        depois,
        usuario,
        antes
      );
    } else {
      // Cria novo endereço
      const novoEndereco = this.enderecoService.createEndereco(data);

      // Vincula aos clientes selecionados
      data.clientesIds.forEach(cliId => {
        this.clienteService.vincularEndereco(cliId, novoEndereco.id);
      });

      const clientesCriadosNomes = data.clientesIds.map(id => {
        const cli = this.clienteService.getClienteById(id);
        return cli ? cli.nome : id;
      });
      this.logService.registrar('criar', 'Endereços',
        `Endereço "${enderecoLabel}" criado`,
        `Quadra: ${data.quadra}\nAlameda: ${data.alameda}\nQI: ${data.qi}\nLote: ${data.lote}\nCasa: ${data.casa || '-'}\nComplemento: ${data.complemento || '-'}\nClientes: ${clientesCriadosNomes.length > 0 ? clientesCriadosNomes.join(', ') : 'Nenhum'}`,
        usuario
      );
    }

    this.closeModal();
  }

  confirmDelete() {
    const endereco = this.selectedEndereco();
    if (endereco) {
      const enderecoLabel = this.getEnderecoFormatado(endereco);

      this.logService.registrar('excluir', 'Endereços',
        `Endereço "${enderecoLabel}" excluído`,
        `ID: ${endereco.id}\nQuadra: ${endereco.quadra}\nAlameda: ${endereco.alameda}\nQI: ${endereco.qi}\nLote: ${endereco.lote}\nCasa: ${endereco.casa || '-'}`,
        this.authService.usuarioLogado()?.usuario ?? 'desconhecido'
      );

      // Remove vínculos dos clientes
      this.clienteService.removerEnderecosDeTodosClientes(endereco.id);

      // Exclui endereço
      this.enderecoService.deleteEndereco(endereco.id);

      this.closeModal();
    }
  }

  // ===== HELPERS =====

  getEnderecoFormatado(endereco: Endereco): string {
    return this.enderecoService.getEnderecoFormatado(endereco);
  }

  getClientesDoEndereco(clientesIds: string[]): Cliente[] {
    return this.clienteService.getClientesByIds(clientesIds);
  }

  getClienteNome(clienteId: string): string {
    const cliente = this.clienteService.getClienteById(clienteId);
    return cliente?.nome || 'Sem nome';
  }

  // ===== PAGINAÇÃO - ENDEREÇOS =====

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

  // ===== PAGINAÇÃO - QUADRAS =====

  goToQuadrasPage(page: number) {
    if (page >= 1 && page <= this.totalQuadrasPages()) {
      this.quadrasPage.set(page);
    }
  }

  previousQuadrasPage() {
    if (this.quadrasPage() > 1) {
      this.quadrasPage.update(p => p - 1);
    }
  }

  nextQuadrasPage() {
    if (this.quadrasPage() < this.totalQuadrasPages()) {
      this.quadrasPage.update(p => p + 1);
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

  filterByQuadra(quadra: string) {
    this.searchTerm.set(quadra);
    this.currentPage.set(1);
  }

  private resetForm() {
    this.formData.set({
      quadra: '',
      alameda: '',
      qi: '',
      lote: '',
      casa: '',
      complemento: '',
      clientesIds: []
    });
    this.clienteSearchTerm.set('');
  }
}