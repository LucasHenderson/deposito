export interface Endereco {
  id: number;
  quadra: string;
  alameda: string;
  qi: string;
  lote: string;
  casa: string;
  complemento: string;
  clientesIds: number[];
}

export interface EnderecoFormData {
  quadra: string;
  alameda: string;
  qi: string;
  lote: string;
  casa: string;
  complemento: string;
  clientesIds: number[];
}

export interface QuadraResumo {
  quadra: string;
  totalEnderecos: number;
}