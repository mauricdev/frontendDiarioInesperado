import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminPanel } from './admin-panel/admin-panel';
import { PublicHome } from './public-home/public-home';
import { SeoService } from './core/seo.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AdminPanel, PublicHome],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('frontend');
  esModoOscuro: boolean = false;

  constructor(private seoService: SeoService) {}

  ngOnInit() {
    this.seoService.generarTags({});
    // Solo activamos oscuro si el usuario hizo clic explícitamente en la luna alguna vez
    if (localStorage.getItem('theme') === 'dark') {
      this.esModoOscuro = true;
      document.documentElement.classList.add('dark');
    } else {
      // Por defecto, SIEMPRE será modo claro
      this.esModoOscuro = false;
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  toggleTema() {
    this.esModoOscuro = !this.esModoOscuro;
    if (this.esModoOscuro) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }
}
