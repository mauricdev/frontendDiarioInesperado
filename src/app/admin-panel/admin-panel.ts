import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Necesario para leer los inputs
import { HttpClient } from '@angular/common/http'; // Para enviar la petición
import { AdminNav } from '../admin-nav/admin-nav';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminNav], // Importamos los módulos aquí
  templateUrl: './admin-panel.html',
})
export class AdminPanel implements OnInit {
  // Aquí guardaremos lo que escribas en el formulario
  historia: any = {
    id: undefined,
    title: '',
    description: '',
    content: '',
    published: true,
    author: 'Lady Whistledown',
    publicarInstagram: false,
    socialSummary: '',
    linkGenerado: '',
    imageUrl: ''
  };

  // Arreglo para listar todas las noticias en el dashboard
  listaNoticias: any[] = [];
  
  // Lista de autores cargados desde la base de datos
  listaAutores: any[] = [];
  autores: any[] = [];

  // Archivo de imagen seleccionado
  imagenSeleccionada: File | null = null;

  // Variables para la generación con IA
  temaIA: string = '';
  contextoAutorIA: string = '';
  generandoIA: boolean = false;

  // Variables para Unsplash
  queryUnsplash: string = '';
  imagenesUnsplash: any[] = [];
  buscandoImagenes: boolean = false;

  // Inyectamos el HttpClient y ChangeDetectorRef
  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.cargarNoticias();
    this.cargarAutores();
  }

  generarConIA() {
    if (!this.temaIA || !this.contextoAutorIA) {
      alert('Por favor, ingresa el tema y la personalidad del autor.');
      return;
    }

    this.generandoIA = true;
    this.cdr.detectChanges();

    this.http.post('http://localhost:3000/posts/generar', { 
      tema: this.temaIA, 
      contextoAutor: this.contextoAutorIA 
    }).subscribe({
      next: (res: any) => {
        console.log('🕵️♂️ RESPUESTA PURA DE LA IA:', res); // Lupa activada
        
        this.historia.title = res.title;
        this.historia.content = res.content;
        this.historia.socialSummary = res.socialSummary;
        
        // Asignamos la palabra clave en inglés al buscador
        this.queryUnsplash = res.imageKeyword || 'error de IA'; 
        this.buscarImagenesUnsplash();
        
        // Ejecutar generación del link si existe el método
        this.generarLink();
        
        this.generandoIA = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al generar:', err);
        this.generandoIA = false;
        this.cdr.detectChanges();
      }
    });
  }

  buscarImagenesUnsplash() {
    this.buscandoImagenes = true;
    this.cdr.detectChanges();

    const q = this.queryUnsplash || this.historia.title || this.temaIA || 'revista';
    
    this.http.get<any[]>(`http://localhost:3000/posts/imagenes/buscar?q=${encodeURIComponent(q)}&page=1`).subscribe({
      next: (res) => {
        this.imagenesUnsplash = res;
        this.buscandoImagenes = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al buscar imágenes en Unsplash:', err);
        this.imagenesUnsplash = [];
        this.buscandoImagenes = false;
        this.cdr.detectChanges();
      }
    });
  }

  seleccionarImagen(url: string) {
    this.historia.imageUrl = url;
    this.imagenesUnsplash = [];
    this.cdr.detectChanges();
  }

  // Carga todos los autores desde el backend
  cargarAutores() {
    this.http.get<any[]>('http://localhost:3000/authors').subscribe({
      next: (data) => {
        this.listaAutores = data;
        this.autores = data;
        if (data && data.length > 0 && !this.historia.id) {
          // Si estamos creando y el autor está vacío o es el por defecto,
          // inicializamos con el primero disponible
          this.historia.author = data[0].name;
        }
        this.cdr.detectChanges();
        console.log('Autores cargados para selector:', data);
      },
      error: (error) => {
        console.error('Error al cargar autores para selector:', error);
      }
    });
  }

  // Carga todas las noticias desde el backend
  cargarNoticias() {
    this.http.get<any[]>('http://localhost:3000/posts').subscribe({
      next: (data) => {
        this.listaNoticias = data;
        this.cdr.detectChanges(); // <-- Forzar detección de cambios sincrónica en Zoneless
        console.log('Noticias cargadas para gestión:', data);
      },
      error: (error) => {
        console.error('Error al cargar noticias en admin:', error);
      }
    });
  }

  // Captura el archivo seleccionado del input
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.imagenSeleccionada = input.files[0];
    } else {
      this.imagenSeleccionada = null;
    }
  }

  // Esta función se ejecutará al hacer clic en el botón guardar/actualizar
  guardarHistoria() {
    console.log('Enviando datos...', this.historia);

    const formData = new FormData();
    formData.append('title', this.historia.title);
    formData.append('description', this.historia.socialSummary || '');
    formData.append('content', this.historia.content);
    formData.append('published', String(this.historia.published));
    formData.append('author', this.historia.author);
    if (this.historia.socialSummary) {
      formData.append('socialSummary', this.historia.socialSummary);
    }

    if (this.imagenSeleccionada) {
      formData.append('file', this.imagenSeleccionada);
    }

    if (this.historia.imageUrl) {
      formData.append('imageUrl', this.historia.imageUrl);
    }

    const esEdicion = !!this.historia.id;
    const url = esEdicion 
      ? `http://localhost:3000/posts/${this.historia.id}` 
      : 'http://localhost:3000/posts';

    const peticion = esEdicion 
      ? this.http.patch(url, formData) 
      : this.http.post(url, formData);

    if (this.historia.publicarInstagram) {
      console.log('⚡ ACCIÓN PENDIENTE: Enviar a la API de Meta');
    }

    peticion.subscribe({
      next: (respuesta) => {
        alert(esEdicion ? '¡Historia actualizada con éxito!' : '¡Historia guardada con éxito en la Base de Datos!');
        console.log('Respuesta del servidor:', respuesta);

        // Limpiamos el formulario y refrescamos la lista
        this.cancelarEdicion();
        this.cargarNoticias();
        this.cdr.detectChanges(); // <-- Forzar detección de cambios sincrónica
      },
      error: (error) => {
        alert('Hubo un error al guardar. Revisa la consola.');
        console.error('Error:', error);
      }
    });
  }

  // Llena el formulario con los datos de la noticia para edición
  editarNoticia(noticia: any) {
    this.historia = {
      id: noticia.id,
      title: noticia.title,
      description: noticia.description,
      content: noticia.content,
      published: noticia.published,
      author: noticia.author || 'Lady Whistledown',
      publicarInstagram: false,
      socialSummary: noticia.socialSummary || '',
      linkGenerado: '',
      imageUrl: noticia.imageUrl || ''
    };
    this.generarLink();
    this.imagenSeleccionada = null;
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    this.cdr.detectChanges(); // <-- Forzar detección de cambios sincrónica
  }

  // Elimina una noticia por ID tras confirmación
  eliminarNoticia(id: number) {
    if (confirm('¿Estás seguro de eliminar esta noticia?')) {
      this.http.delete(`http://localhost:3000/posts/${id}`).subscribe({
        next: () => {
          alert('Historia eliminada con éxito.');
          this.cargarNoticias();
          this.cdr.detectChanges(); // <-- Forzar detección de cambios sincrónica al eliminar
        },
        error: (error) => {
          alert('Hubo un error al eliminar. Revisa la consola.');
          console.error('Error:', error);
        }
      });
    }
  }

  // Cancela la edición y limpia el formulario
  cancelarEdicion() {
    this.historia = {
      id: undefined,
      title: '',
      description: '',
      content: '',
      published: true,
      author: 'Lady Whistledown',
      publicarInstagram: false,
      socialSummary: '',
      linkGenerado: '',
      imageUrl: ''
    };
    this.imagenSeleccionada = null;

    // Limpiamos el valor del input file en el DOM
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    this.cdr.detectChanges(); // <-- Forzar detección de cambios sincrónica
  }

  generarLink() {
    if (!this.historia.title) {
      this.historia.linkGenerado = '';
      return;
    }
    const slug = this.historia.title
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    const id = this.historia.id || 'nuevo';
    this.historia.linkGenerado = `https://eldiarioinesperado.cl/cronica/${id}/${slug}`;
  }
}