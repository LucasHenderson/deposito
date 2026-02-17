import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap, catchError, of } from 'rxjs';
import { Cliente, ClienteFormData, HistoricoCompra } from '../models/cliente.model';

const API_URL = 'http://localhost:8080/api/clientes';

// Interface para o formato de resposta do backend
interface ClienteBackend {
  id: number;
  nome: string;
  telefone: string;
  dataCadastro: string;
  observacoes: string;
  enderecosIds: number[];
}

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private http = inject(HttpClient);
  private clientes = signal<Cliente[]>([]);

  // Histórico de compras (será migrado quando a página de Vendas for conectada ao backend)
  private historicoCompras = signal<HistoricoCompra[]>([]);

  getClientes() {
    return this.clientes.asReadonly();
  }

  carregarClientes(): void {
    this.http.get<ClienteBackend[]>(API_URL).subscribe(data => {
      this.clientes.set(data.map(c => this.fromBackend(c)));
    });
  }

  getClienteById(id: string | number): Cliente | undefined {
    const numId = Number(id);
    return this.clientes().find(c => c.id === numId);
  }

  getClientesByIds(ids: (string | number)[]): Cliente[] {
    const numIds = ids.map(id => Number(id));
    return this.clientes().filter(c => numIds.includes(c.id));
  }

  getTotalClientes(): number {
    return this.clientes().length;
  }

  getHistoricoCompras(clienteId: string | number): HistoricoCompra[] {
    const strId = String(clienteId);
    return this.historicoCompras()
      .filter(h => h.clienteId === strId)
      .sort((a, b) => new Date(b.dataCompra).getTime() - new Date(a.dataCompra).getTime());
  }

  getUltimaCompra(clienteId: string | number): HistoricoCompra | undefined {
    const historico = this.getHistoricoCompras(clienteId);
    return historico.length > 0 ? historico[0] : undefined;
  }

  // Retorna clientes ordenados por última compra (mais antigos primeiro)
  getClientesSemComprasRecentes(): Cliente[] {
    const clientes = [...this.clientes()];

    return clientes.sort((a, b) => {
      const ultimaA = this.getUltimaCompra(a.id);
      const ultimaB = this.getUltimaCompra(b.id);

      // Clientes sem compras vêm primeiro
      if (!ultimaA && !ultimaB) return 0;
      if (!ultimaA) return -1;
      if (!ultimaB) return 1;

      // Ordena por data mais antiga primeiro
      return new Date(ultimaA.dataCompra).getTime() - new Date(ultimaB.dataCompra).getTime();
    });
  }

  // ===== MÉTODOS DE HISTÓRICO (será migrado com Vendas) =====
  adicionarCompra(compra: HistoricoCompra): void {
    this.historicoCompras.update(list => [...list, compra]);
  }

  removerComprasPorVenda(vendaId: string): void {
    this.historicoCompras.update(list =>
      list.filter(h => !h.id.startsWith(vendaId))
    );
  }

  removerCompra(compraId: string): void {
    this.historicoCompras.update(list =>
      list.filter(h => h.id !== compraId)
    );
  }
  // ====================================

  createCliente(data: ClienteFormData): Observable<Cliente | null> {
    const request = this.toBackendRequest(data);
    return this.http.post<ClienteBackend>(API_URL, request).pipe(
      tap(novo => {
        this.clientes.update(list => [...list, this.fromBackend(novo)]);
      }),
      map(novo => this.fromBackend(novo)),
      catchError(() => of(null))
    );
  }

  updateCliente(id: number, data: ClienteFormData): Observable<boolean> {
    const request = this.toBackendRequest(data);
    return this.http.put<ClienteBackend>(`${API_URL}/${id}`, request).pipe(
      tap(atualizado => {
        this.clientes.update(list =>
          list.map(c => c.id === id ? this.fromBackend(atualizado) : c)
        );
      }),
      map(() => true),
      catchError(() => of(false))
    );
  }

  deleteCliente(id: number): Observable<boolean> {
    return this.http.delete<void>(`${API_URL}/${id}`).pipe(
      tap(() => {
        this.clientes.update(list => list.filter(c => c.id !== id));
        // Remove histórico de compras local
        this.historicoCompras.update(list => list.filter(h => h.clienteId !== String(id)));
      }),
      map(() => true),
      catchError(() => of(false))
    );
  }

  // Atualiza o signal local removendo um endereço de todos os clientes
  // (usado quando um endereço é deletado, para manter consistência local)
  removerEnderecosDeTodosClientes(enderecoId: number): void {
    this.clientes.update(list =>
      list.map(c => ({
        ...c,
        enderecosIds: c.enderecosIds.filter(id => id !== enderecoId)
      }))
    );
  }

  // Formata telefone para link do WhatsApp
  getWhatsAppLink(telefone: string): string {
    const numero = telefone.replace(/\D/g, '');
    const numeroComDDI = numero.startsWith('55') ? numero : `55${numero}`;
    return `https://wa.me/${numeroComDDI}`;
  }

  // Gera texto para copiar com dados do cliente
  gerarTextoCadastro(cliente: Cliente, enderecos: string[]): string {
    let texto = `✅ *Cadastro Realizado - Léo Gás*\n\n`;
    texto += `👤 *Cliente:* ${cliente.nome || 'Não informado'}\n`;
    texto += `📱 *Telefone:* ${cliente.telefone || 'Não informado'}\n`;
    texto += `📅 *Data de Cadastro:* ${this.formatarData(cliente.dataCadastro)}\n`;

    if (enderecos.length > 0) {
      texto += `\n📍 *Endereço(s):*\n`;
      enderecos.forEach((end, i) => {
        texto += `   ${i + 1}. ${end}\n`;
      });
    }

    if (cliente.observacoes) {
      texto += `\n📝 *Observações:* ${cliente.observacoes}\n`;
    }

    texto += `\nInformações estão corretas? ✅`;
    return texto;
  }

  // Gera texto com dados e histórico do cliente
  gerarTextoResumo(cliente: Cliente, enderecos: string[], historico: HistoricoCompra[]): string {
    let texto = `📋 *Resumo do Cliente - Léo Gás*\n\n`;
    texto += `👤 *Nome:* ${cliente.nome || 'Não informado'}\n`;
    texto += `📱 *Telefone:* ${cliente.telefone || 'Não informado'}\n`;

    if (enderecos.length > 0) {
      texto += `\n📍 *Endereço(s):*\n`;
      enderecos.forEach((end, i) => {
        texto += `   ${i + 1}. ${end}\n`;
      });
    }

    if (historico.length > 0) {
      texto += `\n🛒 *Últimos Pedidos:*\n`;
      historico.slice(0, 3).forEach((h, i) => {
        texto += `   ${i + 1}. ${h.produtoNome} (${h.quantidade}x) - R$ ${h.valorTotal.toFixed(2).replace('.', ',')} - ${this.formatarData(h.dataCompra)}\n`;
      });
    } else {
      texto += `\n🛒 *Pedidos:* Nenhum pedido registrado\n`;
    }

    texto += `\n_Obrigado pela preferência!_ 🔥`;
    return texto;
  }

  private formatarData(data: Date): string {
    return new Date(data).toLocaleDateString('pt-BR');
  }

  private fromBackend(c: ClienteBackend): Cliente {
    return {
      id: c.id,
      nome: c.nome,
      telefone: c.telefone,
      dataCadastro: new Date(c.dataCadastro),
      observacoes: c.observacoes || '',
      enderecosIds: c.enderecosIds || []
    };
  }

  private toBackendRequest(data: ClienteFormData): any {
    const dataCadastro = data.dataCadastro instanceof Date
      ? data.dataCadastro.toISOString().split('T')[0]
      : String(data.dataCadastro);
    return {
      nome: data.nome,
      telefone: data.telefone,
      dataCadastro: dataCadastro,
      observacoes: data.observacoes || '',
      enderecosIds: data.enderecosIds
    };
  }
}
