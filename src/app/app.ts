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

  constructor(private seoService: SeoService) {}

  ngOnInit() {
    this.seoService.generarTags({});
  }
}
