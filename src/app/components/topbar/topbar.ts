import { Component, EventEmitter, Output } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-topbar',
  imports: [RouterModule],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class Topbar {

  constructor(private router: Router) {}

  @Output() toggleSidebar = new EventEmitter<void>();
  isMenuOpen = false;

  logout() {
    this.router.navigate(['/login']);
  }
}
