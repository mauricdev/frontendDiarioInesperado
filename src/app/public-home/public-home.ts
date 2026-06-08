import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { environment } from '../../environments/environment';

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

  autorSeleccionado: string = 'Todos';
  autoresDisponibles: string[] = [];

  paginaActual: number = 1;
  limitePorPagina: number = 12;
  noHayMasNoticias: boolean = false;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.cargarNoticias(1);
  }

  cargarNoticias(nuevaPagina: number = 1) {
    this.paginaActual = nuevaPagina;
    
    this.http.get<any[]>(`${environment.apiUrl}/posts?page=${this.paginaActual}&limit=${this.limitePorPagina}`)
      .subscribe({
        next: (data) => {
          if (nuevaPagina === 1) {
            this.noticias.set(data);
          } else {
            this.noticias.set([...this.noticias(), ...data]);
          }
          
          this.autoresDisponibles = ['Todos', ...new Set(this.noticias().map(n => n.author).filter(a => a))];
          
          if (data.length < this.limitePorPagina) {
            this.noHayMasNoticias = true;
          } else {
            this.noHayMasNoticias = false;
          }
          this.cdr.detectChanges();
          console.log('Noticias cargadas con éxito:', data);
        },
        error: (err) => {
          console.error('Error al cargar las noticias:', err);
        }
      });
  }

  cargarMas() {
    this.cargarNoticias(this.paginaActual + 1);
  }

  filtrarPorAutor(autor: string) {
    this.autorSeleccionado = autor;
    this.cdr.detectChanges();
  }

  get noticiasFiltradas() {
    if (this.autorSeleccionado === 'Todos') return this.noticias();
    return this.noticias().filter(n => n.author === this.autorSeleccionado);
  }
}
