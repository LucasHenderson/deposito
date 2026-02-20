export interface VariavelEstoque {
  id: number;
  nome: string;
  quantidade: number;
  dataExclusao: string | null;
}

export interface VariavelEstoqueFormData {
  nome: string;
  quantidade: number;
}

export interface AjusteEstoque {
  id: number;
  variavelEstoqueId: number;
  delta: number;
  dataAjuste: string;
}