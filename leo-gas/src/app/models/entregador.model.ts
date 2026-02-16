export interface Entregador {
  id: string;
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