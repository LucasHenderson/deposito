import { Injectable, signal } from '@angular/core';
import { Produto, ProdutoFormData } from '../models/produto.model';

@Injectable({
  providedIn: 'root'
})
export class ProdutoService {
  private produtos = signal<Produto[]>([
    {
      id: '1',
      nome: 'Gás de Cozinha P13 - Troca',
      precos: {
        credito: 145.00,
        debito: 140.00,
        dinheiro: 140.00,
        pix: 140.00
      },
      quantidadeEstoque: 70
    },
    {
      id: '2',
      nome: 'Gás de Cozinha P13 - Completo',
      precos: {
        credito: 350.00,
        debito: 350.00,
        dinheiro: 350.00,
        pix: 350.00
      },
      quantidadeEstoque: 70
    },
    {
      id: '3',
      nome: 'Água Mineral 20L - Troca',
      precos: {
        credito: 17.00,
        debito: 17.00,
        dinheiro: 17.00,
        pix: 17.00
      },
      quantidadeEstoque: 5
    },
    {
      id: '4',
      nome: 'Água Mineral 20L - Completo',
      precos: {
        credito: 47.00,
        debito: 47.00,
        dinheiro: 47.00,
        pix: 47.00
      },
      quantidadeEstoque: 100
    },
    {
      id: '6',
      nome: 'Registro Regulador - Com Mangueira',
      precos: {
        credito: 100.00,
        debito: 100.00,
        dinheiro: 90.00,
        pix: 90.00
      },
      quantidadeEstoque: 8
    }
  ]);

  getProdutos() {
    return this.produtos.asReadonly();
  }

  createProduto(data: ProdutoFormData): boolean {
    const newProduto: Produto = {
      id: this.generateId(),
      nome: data.nome,
      precos: data.precos,
      quantidadeEstoque: data.quantidadeEstoque
    };

    this.produtos.update(list => [...list, newProduto]);
    return true;
  }

  updateProduto(id: string, data: ProdutoFormData): boolean {
    this.produtos.update(list =>
      list.map(p => p.id === id ? { ...p, ...data } : p)
    );
    return true;
  }

  deleteProduto(id: string): void {
    this.produtos.update(list => list.filter(p => p.id !== id));
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}