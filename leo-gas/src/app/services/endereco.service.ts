import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap, catchError, of } from 'rxjs';
import { Endereco, EnderecoFormData, QuadraResumo } from '../models/endereco.model';

const API_URL = 'http://localhost:8080/api/enderecos';

// Interface para o formato de resposta do backend
interface EnderecoBackend {
  id: number;
  quadra: string;
  alameda: string;
  qi: string;
  lote: string;
  casa: string;
  complemento: string;
  clientesIds: number[];
}

@Injectable({
  providedIn: 'root'
})
export class EnderecoService {
  private http = inject(HttpClient);
  private enderecos = signal<Endereco[]>([]);

  getEnderecos() {
    return this.enderecos.asReadonly();
  }

  carregarEnderecos(): void {
    this.http.get<EnderecoBackend[]>(API_URL).subscribe(data => {
      this.enderecos.set(data.map(e => this.fromBackend(e)));
    });
  }

  getEnderecoById(id: string | number): Endereco | undefined {
    const numId = Number(id);
    return this.enderecos().find(e => e.id === numId);
  }

  getEnderecosByIds(ids: (string | number)[]): Endereco[] {
    const numIds = ids.map(id => Number(id));
    return this.enderecos().filter(e => numIds.includes(e.id));
  }

  getEnderecoFormatado(endereco: Endereco): string {
    const partes: string[] = [];
    if (endereco.quadra) partes.push(`Qd. ${endereco.quadra}`);
    if (endereco.alameda) partes.push(`Al. ${endereco.alameda}`);
    if (endereco.qi) partes.push(endereco.qi);
    if (endereco.lote) partes.push(`Lt. ${endereco.lote}`);
    if (endereco.casa) partes.push(`Casa ${endereco.casa}`);
    if (endereco.complemento) partes.push(`(${endereco.complemento})`);
    return partes.join(', ') || 'Endereço não informado';
  }

  getQuadrasResumo(): QuadraResumo[] {
    const quadrasMap = new Map<string, number>();

    this.enderecos().forEach(endereco => {
      if (endereco.quadra) {
        const count = quadrasMap.get(endereco.quadra) || 0;
        quadrasMap.set(endereco.quadra, count + 1);
      }
    });

    const resumo: QuadraResumo[] = [];
    quadrasMap.forEach((total, quadra) => {
      resumo.push({ quadra, totalEnderecos: total });
    });

    return resumo.sort((a, b) => b.totalEnderecos - a.totalEnderecos);
  }

  createEndereco(data: EnderecoFormData): Observable<Endereco | null> {
    const request = this.toBackendRequest(data);
    return this.http.post<EnderecoBackend>(API_URL, request).pipe(
      tap(novo => {
        this.enderecos.update(list => [...list, this.fromBackend(novo)]);
      }),
      map(novo => this.fromBackend(novo)),
      catchError(() => of(null))
    );
  }

  updateEndereco(id: number, data: EnderecoFormData): Observable<boolean> {
    const request = this.toBackendRequest(data);
    return this.http.put<EnderecoBackend>(`${API_URL}/${id}`, request).pipe(
      tap(atualizado => {
        this.enderecos.update(list =>
          list.map(e => e.id === id ? this.fromBackend(atualizado) : e)
        );
      }),
      map(() => true),
      catchError(() => of(false))
    );
  }

  deleteEndereco(id: number): Observable<boolean> {
    return this.http.delete<void>(`${API_URL}/${id}`).pipe(
      tap(() => {
        this.enderecos.update(list => list.filter(e => e.id !== id));
      }),
      map(() => true),
      catchError(() => of(false))
    );
  }

  // Atualiza o signal local removendo um cliente de todos os endereços
  // (usado quando um cliente é deletado, para manter consistência local)
  removerClienteDeTodosEnderecos(clienteId: number): void {
    this.enderecos.update(list =>
      list.map(e => ({
        ...e,
        clientesIds: e.clientesIds.filter(id => id !== clienteId)
      }))
    );
  }

  private fromBackend(e: EnderecoBackend): Endereco {
    return {
      id: e.id,
      quadra: e.quadra,
      alameda: e.alameda,
      qi: e.qi || '',
      lote: e.lote,
      casa: e.casa || '',
      complemento: e.complemento || '',
      clientesIds: e.clientesIds || []
    };
  }

  private toBackendRequest(data: EnderecoFormData): any {
    return {
      quadra: data.quadra,
      alameda: data.alameda,
      qi: data.qi || '',
      lote: data.lote,
      casa: data.casa || '',
      complemento: data.complemento || '',
      clientesIds: data.clientesIds
    };
  }
}
