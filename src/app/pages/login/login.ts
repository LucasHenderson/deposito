import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private router = inject(Router);
  private themeService = inject(ThemeService);

  // Campos do formulário
  usuario = signal('');
  senha = signal('');
  
  // Estado do formulário
  showPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');

  // Expondo o sinal do tema para o template
  isDarkMode = this.themeService.isDarkMode;

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  togglePasswordVisibility() {
    this.showPassword.update(v => !v);
  }

  updateUsuario(event: Event) {
    const input = event.target as HTMLInputElement;
    this.usuario.set(input.value);
    this.errorMessage.set('');
  }

  updateSenha(event: Event) {
    const input = event.target as HTMLInputElement;
    this.senha.set(input.value);
    this.errorMessage.set('');
  }

  handleSubmit(event: Event) {
    event.preventDefault();
    
    // Limpa mensagem de erro anterior
    this.errorMessage.set('');

    // Validação básica
    if (!this.usuario().trim()) {
      this.errorMessage.set('Digite o usuário');
      return;
    }

    if (!this.senha().trim()) {
      this.errorMessage.set('Digite a senha');
      return;
    }

    // Simula carregamento
    this.isLoading.set(true);

    // Simulação de autenticação (substituir por chamada real à API)
    setTimeout(() => {
      // Credenciais de exemplo para teste
      if (this.usuario() === 'admin' && this.senha() === 'admin') {
        this.router.navigate(['/painel-principal']);
      } else {
        this.errorMessage.set('Usuário ou senha incorretos');
      }
      this.isLoading.set(false);
    }, 1000);
  }
}