import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';

export type UserRole = 'admin' | 'atendente';

export interface UsuarioLogado {
  usuario: string;
  role: UserRole;
}

interface LoginResponse {
  token: string;
  usuario: string;
  role: UserRole;
}

const STORAGE_KEY = 'leogas_auth';
const TOKEN_KEY = 'leogas_token';
const API_URL = 'http://localhost:8080/api/auth';

const ROTAS_ATENDENTE = ['vendas', 'clientes', 'enderecos'];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  usuarioLogado = signal<UsuarioLogado | null>(this.carregarSessao());

  isLoggedIn = computed(() => this.usuarioLogado() !== null);
  isAdmin = computed(() => this.usuarioLogado()?.role === 'admin');

  login(usuario: string, senha: string): Observable<boolean> {
    return this.http.post<LoginResponse>(`${API_URL}/login`, { usuario, senha }).pipe(
      map((response) => {
        const user: UsuarioLogado = { usuario: response.usuario, role: response.role };
        localStorage.setItem(TOKEN_KEY, response.token);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        this.usuarioLogado.set(user);
        return true;
      }),
      catchError(() => of(false)),
    );
  }

  logout(): void {
    this.usuarioLogado.set(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
  }

  temAcesso(rota: string): boolean {
    const user = this.usuarioLogado();
    if (!user) return false;
    if (user.role === 'admin') return true;
    return ROTAS_ATENDENTE.includes(rota);
  }

  getRotaInicial(): string {
    const user = this.usuarioLogado();
    if (!user) return '/login';
    return user.role === 'admin' ? '/painel-principal' : '/vendas';
  }

  private carregarSessao(): UsuarioLogado | null {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const data = localStorage.getItem(STORAGE_KEY);
      if (token && data) {
        const parsed = JSON.parse(data) as UsuarioLogado;
        if (parsed.usuario && parsed.role) {
          return parsed;
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
    }
    return null;
  }
}
