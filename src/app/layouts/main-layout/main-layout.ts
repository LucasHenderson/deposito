import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Topbar } from '../../components/topbar/topbar';
import { Sidebar } from '../../components/sidebar/sidebar';


@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, Topbar, Sidebar],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {
    protected readonly title = signal('leo-gas');

    topbarVisible = false; // Controle global da topbar
    sidebarVisible = false; // Controle global da sidebar

    toggle() {
      this.topbarVisible = !this.topbarVisible;
      this.sidebarVisible =!this.sidebarVisible;
    }
}
