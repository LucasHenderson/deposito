import { Component, EventEmitter, Output, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-topbar',
  imports: [],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class Topbar {
  private router = inject(Router);
  private themeService = inject(ThemeService);

  @Output() toggleSidebar = new EventEmitter<void>();
  isMenuOpen = false;

  // Expondo o sinal do tema para o template
  isDarkMode = this.themeService.isDarkMode;

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  logout() {
    this.isMenuOpen = false;
    this.router.navigate(['/login']);
  }
}