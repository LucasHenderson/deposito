import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  isDarkMode = signal<boolean>(false);

  constructor() {
    // Carrega o tema salvo no localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.isDarkMode.set(savedTheme === 'dark');
    } else {
      // Detecta preferência do sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.isDarkMode.set(prefersDark);
    }

    // Aplica o tema ao carregar
    effect(() => {
      this.applyTheme();
    });
  }

  toggleTheme() {
    this.isDarkMode.update(value => !value);
    this.applyTheme();
  }

  private applyTheme() {
    const theme = this.isDarkMode() ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }
}