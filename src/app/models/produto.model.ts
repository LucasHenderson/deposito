export interface PrecoPorPagamento {
  credito: number;
  debito: number;
  dinheiro: number;
  pix: number;
}

export interface Produto {
  id: string;
  nome: string;
  precos: PrecoPorPagamento;
  quantidadeEstoque: number;
}

export interface ProdutoFormData {
  nome: string;
  precos: PrecoPorPagamento;
  quantidadeEstoque: number;
}