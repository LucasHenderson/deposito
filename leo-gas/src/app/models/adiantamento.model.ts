export interface Adiantamento {
  id: number;
  entregadorId: number;
  descricao: string;
  data: string;
  valor: number;
}

export interface AdiantamentoFormData {
  descricao: string;
  data: Date;
  valor: number;
}

export interface EntregadorComAdiantamentos {
  entregadorId: string;
  entregadorNome: string;
  entregadorIdentificador: string;
  ativo: boolean;
  adiantamentos: Adiantamento[];
}
