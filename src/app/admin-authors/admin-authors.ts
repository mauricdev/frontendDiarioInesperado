import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AdminNav } from '../admin-nav/admin-nav';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-admin-admin-authors',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminNav],
  templateUrl: './admin-authors.html',
  styleUrl: './admin-authors.scss',
})
export class AdminAuthors implements OnInit {
  autor: any = {
    id: undefined,
    name: '',
    bio: ''
  };

  listaAutores: any[] = [];

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.cargarAutores();
  }

  cargarAutores() {
    this.http.get<any[]>(`${environment.apiUrl}/authors`).subscribe({
      next: (data) => {
        this.listaAutores = data;
        this.cdr.detectChanges();
        console.log('Autores cargados:', data);
      },
      error: (error) => {
        console.error('Error al cargar autores:', error);
      }
    });
  }

  guardarAutor() {
    if (!this.autor.name || !this.autor.name.trim()) {
      alert('El nombre del autor es obligatorio.');
      return;
    }

    console.log('Guardando autor...', this.autor);
    const esEdicion = !!this.autor.id;
    const url = esEdicion 
      ? `${environment.apiUrl}/authors/${this.autor.id}`
      : `${environment.apiUrl}/authors`;

    const peticion = esEdicion
      ? this.http.patch(url, { name: this.autor.name, bio: this.autor.bio })
      : this.http.post(url, { name: this.autor.name, bio: this.autor.bio });

    peticion.subscribe({
      next: (respuesta) => {
        alert(esEdicion ? '¡Autor actualizado con éxito!' : '¡Autor guardado con éxito!');
        this.cancelarEdicion();
        this.cargarAutores();
        this.cdr.detectChanges();
      },
      error: (error) => {
        alert('Hubo un error al guardar. Revisa la consola.');
        console.error('Error:', error);
      }
    });
  }

  editarAutor(autor: any) {
    this.autor = {
      id: autor.id,
      name: autor.name,
      bio: autor.bio || ''
    };
    this.cdr.detectChanges();
  }

  eliminarAutor(id: number) {
    if (confirm('¿Estás seguro de eliminar este autor?')) {
      this.http.delete(`${environment.apiUrl}/authors/${id}`).subscribe({
        next: () => {
          alert('Autor eliminado con éxito.');
          this.cargarAutores();
          this.cdr.detectChanges();
        },
        error: (error) => {
          alert('Hubo un error al eliminar. Revisa la consola.');
          console.error('Error:', error);
        }
      });
    }
  }

  cancelarEdicion() {
    this.autor = {
      id: undefined,
      name: '',
      bio: ''
    };
    this.cdr.detectChanges();
  }
}
