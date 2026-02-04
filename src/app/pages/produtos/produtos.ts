import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProdutoService } from '../../services/produto.service';
import { Produto, ProdutoFormData, PrecoPorPagamento } from '../../models/produto.model';

type ModalType = 'create' | 'edit' | 'delete' | null;
type SortOrder = 'maior-estoque' | 'menor-estoque' | 'nenhum';

@Component({
  selector: 'app-produtos',
  imports: [CommonModule, FormsModule],
  templateUrl: './produtos.html',
  styleUrl: './produtos.css',
})
export class Produtos {
  private produtoService = inject(ProdutoService);

  // Paginação
  currentPage = signal(1);
  itemsPerPage = signal(6);
  
  // Modal
  modalType = signal<ModalType>(null);
  selectedProduto = signal<Produto | null>(null);
  
  // Formulário
  formData = signal<ProdutoFormData>({
    nome: '',
    precos: {
      credito: 0,
      debito: 0,
      dinheiro: 0,
      pix: 0
    },
    quantidadeEstoque: 0
  });
  
  formErrors = signal({
    nome: '',
    credito: '',
    debito: '',
    dinheiro: '',
    pix: '',
    quantidadeEstoque: ''
  });

  // Busca e ordenação
  searchTerm = signal('');
  sortOrder = signal<SortOrder>('nenhum');

  // Computed
  produtos = this.produtoService.getProdutos();
  
  filteredProdutos = computed(() => {
    let list = this.produtos();
    
    // Busca por nome
    const search = this.searchTerm().toLowerCase().trim();
    if (search) {
      list = list.filter(p => 
        p.nome.toLowerCase().includes(search)
      );
    }
    
    // Ordenação por estoque
    const order = this.sortOrder();
    if (order === 'maior-estoque') {
      list = [...list].sort((a, b) => b.quantidadeEstoque - a.quantidadeEstoque);
    } else if (order === 'menor-estoque') {
      list = [...list].sort((a, b) => a.quantidadeEstoque - b.quantidadeEstoque);
    }
    
    return list;
  });

  totalPages = computed(() => 
    Math.ceil(this.filteredProdutos().length / this.itemsPerPage())
  );

  paginatedProdutos = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return this.filteredProdutos().slice(start, end);
  });

  pages = computed(() => {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  // Ações de Modal
  openCreateModal() {
    this.resetForm();
    this.modalType.set('create');
  }

  openEditModal(produto: Produto) {
    this.selectedProduto.set(produto);
    this.formData.set({
      nome: produto.nome,
      precos: { ...produto.precos },
      quantidadeEstoque: produto.quantidadeEstoque
    });
    this.modalType.set('edit');
  }

  openDeleteModal(produto: Produto) {
    this.selectedProduto.set(produto);
    this.modalType.set('delete');
  }

  closeModal() {
    this.modalType.set(null);
    this.selectedProduto.set(null);
    this.resetForm();
  }

  // Validação
  validateForm(): boolean {
    const errors = {
      nome: '',
      credito: '',
      debito: '',
      dinheiro: '',
      pix: '',
      quantidadeEstoque: ''
    };

    const data = this.formData();

    if (!data.nome.trim()) {
      errors.nome = 'Nome do produto é obrigatório';
    } else if (data.nome.trim().length < 3) {
      errors.nome = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (!data.precos.credito || data.precos.credito <= 0) {
      errors.credito = 'Preço no crédito é obrigatório';
    }

    if (!data.precos.debito || data.precos.debito <= 0) {
      errors.debito = 'Preço no débito é obrigatório';
    }

    if (!data.precos.dinheiro || data.precos.dinheiro <= 0) {
      errors.dinheiro = 'Preço em dinheiro é obrigatório';
    }

    if (!data.precos.pix || data.precos.pix <= 0) {
      errors.pix = 'Preço no PIX é obrigatório';
    }

    if (data.quantidadeEstoque < 0) {
      errors.quantidadeEstoque = 'Quantidade não pode ser negativa';
    }

    this.formErrors.set(errors);
    return !errors.nome && !errors.credito && !errors.debito && !errors.dinheiro && !errors.pix && !errors.quantidadeEstoque;
  }

  // Atualizar campos do formulário
  updateNome(event: Event) {
    const input = event.target as HTMLInputElement;
    this.formData.update(data => ({ ...data, nome: input.value }));
  }

  updatePrecoCredito(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value) || 0;
    this.formData.update(data => ({ 
      ...data, 
      precos: { ...data.precos, credito: value }
    }));
  }

  updatePrecoDebito(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value) || 0;
    this.formData.update(data => ({ 
      ...data, 
      precos: { ...data.precos, debito: value }
    }));
  }

  updatePrecoDinheiro(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value) || 0;
    this.formData.update(data => ({ 
      ...data, 
      precos: { ...data.precos, dinheiro: value }
    }));
  }

  updatePrecoPix(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value) || 0;
    this.formData.update(data => ({ 
      ...data, 
      precos: { ...data.precos, pix: value }
    }));
  }

  updateQuantidade(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = parseInt(input.value) || 0;
    this.formData.update(data => ({ ...data, quantidadeEstoque: value }));
  }

  // Ações CRUD
  handleSubmit() {
    if (!this.validateForm()) {
      return;
    }

    const data = this.formData();
    const isEdit = this.modalType() === 'edit';
    
    if (isEdit) {
      this.produtoService.updateProduto(this.selectedProduto()!.id, data);
    } else {
      this.produtoService.createProduto(data);
    }

    this.closeModal();
  }

  confirmDelete() {
    const produto = this.selectedProduto();
    if (produto) {
      this.produtoService.deleteProduto(produto.id);
      this.closeModal();
    }
  }

  // Paginação
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

  // Busca
  updateSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.currentPage.set(1);
  }

  clearSearch() {
    this.searchTerm.set('');
    this.currentPage.set(1);
  }

  // Ordenação
  changeSortOrder(order: SortOrder) {
    this.sortOrder.set(order);
    this.currentPage.set(1);
  }

  // Helpers
  getEstoqueStatus(quantidade: number): 'critico' | 'baixo' | 'normal' {
    if (quantidade <= 5) return 'critico';
    if (quantidade <= 15) return 'baixo';
    return 'normal';
  }

  getMelhorPreco(precos: PrecoPorPagamento): number {
    return Math.min(precos.credito, precos.debito, precos.dinheiro, precos.pix);
  }

  private resetForm() {
    this.formData.set({
      nome: '',
      precos: {
        credito: 0,
        debito: 0,
        dinheiro: 0,
        pix: 0
      },
      quantidadeEstoque: 0
    });
    this.formErrors.set({
      nome: '',
      credito: '',
      debito: '',
      dinheiro: '',
      pix: '',
      quantidadeEstoque: ''
    });
  }
}