export interface Entregador {
  id: number;
  nomeCompleto: string;
  telefone: string;
  identificador: string;
  salario: number;
  ativo: boolean;
  dataCadastro: Date;
}

export interface EntregadorFormData {
  nomeCompleto: string;
  telefone: string;
  identificador: string;
  salario: number;
  dataCadastro: Date;
}