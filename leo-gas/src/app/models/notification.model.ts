export interface Notificacao {
  id: number;
  vendaId: number;
  clienteNome: string;
  valorTotal: number;
  mensagem: string;
  dataAgendada: string;
  lida: boolean;
  criadaEm: string;
}
