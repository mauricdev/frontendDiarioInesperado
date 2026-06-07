import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { marked } from 'marked';
import { SeoService } from '../core/seo.service';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './post-detail.html',
  styleUrl: './post-detail.scss',
})
export class PostDetail implements OnInit {
  noticia = signal<any>(null);
  parsedContent = signal<string>('');

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private seoService: SeoService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe({
      next: (params) => {
        const id = params.get('id');
        if (id) {
          this.cargarNoticia(id);
        }
      },
      error: (err) => {
        console.error('Error al leer parámetros de ruta:', err);
      }
    });
  }

  private cargarNoticia(id: string) {
    this.http.get<any>(`http://localhost:3000/posts/${id}`).subscribe({
      next: async (data) => {
        this.noticia.set(data);
        const parsedHtml = await marked.parse(data.content || '');
        this.parsedContent.set(parsedHtml);
        
        // Inyectamos el SEO dinámico
        this.seoService.generarTags({
          title: data.title,
          description: data.socialSummary,
          image: data.imageUrl,
          slug: 'noticia/' + data.id
        });

        console.log('Detalle de noticia cargado:', data);
      },
      error: (err) => {
        console.error('Error al cargar detalle de noticia:', err);
      }
    });
  }
}
