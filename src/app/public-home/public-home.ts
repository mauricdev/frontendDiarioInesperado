import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-public-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './public-home.html',
  styleUrl: './public-home.scss',
})
export class PublicHome implements OnInit {
  noticias = signal<any[]>([]);
  fechaActual = new Intl.DateTimeFormat('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date());

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any[]>('http://localhost:3000/posts').subscribe({
      next: (data) => {
        this.noticias.set(data);
        console.log('Noticias cargadas con éxito:', data);
      },
      error: (err) => {
        console.error('Error al cargar las noticias:', err);
      }
    });
  }
}
