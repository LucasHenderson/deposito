import { Injectable, signal, computed } from '@angular/core';

export type UserRole = 'admin' | 'atendente';

export interface UsuarioLogado {
  usuario: string;
  role: UserRole;
}

interface Credencial {
  usuario: string;
  senha: string;
  role: UserRole;
}

const STORAGE_KEY = 'leogas_auth';

const ROTAS_ATENDENTE = ['vendas', 'clientes', 'enderecos'];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private credenciais: Credencial[] = [
    { usuario: 'leogas@adm', senha: '#Leo262731', role: 'admin' },
    { usuario: 'atendente@leogas', senha: '!atendente123', role: 'atendente' },
  ];

  usuarioLogado = signal<UsuarioLogado | null>(this.carregarSessao());

  isLoggedIn = computed(() => this.usuarioLogado() !== null);
  isAdmin = computed(() => this.usuarioLogado()?.role === 'admin');

  login(usuario: string, senha: string): boolean {
    const credencial = this.credenciais.find(
      (c) => c.usuario === usuario && c.senha === senha
    );

    if (credencial) {
      const user: UsuarioLogado = { usuario: credencial.usuario, role: credencial.role };
      this.usuarioLogado.set(user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      return true;
    }

    return false;
  }

  logout(): void {
    this.usuarioLogado.set(null);
    localStorage.removeItem(STORAGE_KEY);
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
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data) as UsuarioLogado;
        if (parsed.usuario && parsed.role) {
          return parsed;
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    return null;
  }
}
