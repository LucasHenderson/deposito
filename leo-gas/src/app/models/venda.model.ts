export type StatusVenda = 'a-entregar' | 'entregando' | 'entregue';
export type FormaPagamento = 'credito' | 'debito' | 'dinheiro' | 'pix';

export interface ItemVenda {
  produtoId: number;
  produtoNome: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

export interface PagamentoVenda {
  forma: FormaPagamento;
  valor: number;
}

export interface Venda {
  id: number;
  clienteId: number;
  clienteNome: string;
  clienteTelefone: string;
  enderecoId: number;
  enderecoFormatado: string;
  entregadorId: number;
  entregadorIdentificador: string;
  itens: ItemVenda[];
  pagamentos: PagamentoVenda[];
  valorTotal: number;
  status: StatusVenda;
  recebimentoPendente: boolean;
  dataVenda: string;
  observacoes: string;
}

export interface VendaFormData {
  clienteId: number;
  enderecoId: number;
  entregadorId: number;
  itens: ItemVenda[];
  pagamentos: PagamentoVenda[];
  valorTotal: number;
  observacoes: string;
}
