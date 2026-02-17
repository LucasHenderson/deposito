export interface Cliente {
  id: number;
  nome: string;
  telefone: string;
  enderecosIds: number[];
  dataCadastro: Date;
  observacoes: string;
}

export interface ClienteFormData {
  nome: string;
  telefone: string;
  enderecosIds: number[];
  dataCadastro: Date;
  observacoes: string;
}

export interface HistoricoCompra {
  id: string;
  clienteId: string;
  produtoNome: string;
  quantidade: number;
  valorTotal: number;
  formaPagamento: string;
  dataCompra: Date;
  enderecoEntrega: string;
}