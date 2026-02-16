export type LogAcao = 'criar' | 'editar' | 'excluir' | 'pendencia';
export type LogModulo = 'Vendas' | 'Clientes' | 'Endereços';

export interface LogEntry {
  id: number;
  acao: LogAcao;
  modulo: LogModulo;
  resumo: string;
  detalhes: string;
  detalhesAntes?: string;
  usuario: string;
  data: Date;
}
