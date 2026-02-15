export type LogAcao = 'criar' | 'editar' | 'excluir';
export type LogModulo = 'Vendas' | 'Clientes' | 'Endereços';

export interface LogEntry {
  id: string;
  acao: LogAcao;
  modulo: LogModulo;
  resumo: string;
  detalhes: string;
  detalhesAntes?: string;
  usuario: string;
  data: Date;
}
