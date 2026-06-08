import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { marked } from 'marked';
import { SeoService } from '../core/seo.service';
import { environment } from '../../environments/environment';

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
  historia: any = null;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private seoService: SeoService,
    private meta: Meta,
    private title: Title
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
    this.http.get<any>(`${environment.apiUrl}/posts/${id}`).subscribe({
      next: async (data) => {
        this.noticia.set(data);
        this.historia = data;
        const parsedHtml = await marked.parse(data.content || '');
        this.parsedContent.set(parsedHtml);
        
        // Inyectamos el SEO dinámico
        this.seoService.generarTags({
          title: data.title,
          description: data.socialSummary,
          image: data.imageUrl,
          slug: 'noticia/' + data.id
        });

        this.actualizarMetaTags();

        console.log('Detalle de noticia cargado:', data);
      },
      error: (err) => {
        console.error('Error al cargar detalle de noticia:', err);
      }
    });
  }

  actualizarMetaTags() {
    if (!this.historia) return;
    
    // 1. Actualizar el título de la pestaña del navegador
    this.title.setTitle(`${this.historia.title} | El Diario Inesperado`);

    // 2. Limpiar etiquetas anteriores para evitar duplicados
    this.meta.removeTag('property="og:title"');
    this.meta.removeTag('property="og:description"');
    this.meta.removeTag('property="og:image"');
    this.meta.removeTag('property="og:url"');

    // 3. Inyectar las nuevas etiquetas Open Graph
    this.meta.addTags([
      { property: 'og:type', content: 'article' },
      { property: 'og:title', content: this.historia.title },
      { property: 'og:description', content: this.historia.socialSummary || this.historia.description },
      { property: 'og:image', content: this.historia.imageUrl || 'https://eldiarioinesperado.cl/assets/logo.png' },
      { property: 'og:url', content: window.location.href },
      { name: 'twitter:card', content: 'summary_large_image' }
    ]);
  }

  compartirWhatsApp() {
    const url = encodeURIComponent(window.location.href);
    const postData = this.noticia();
    const texto = encodeURIComponent(`¡Mira esta increíble crónica de ${postData?.author || 'nuestro diario'}! 📰\n\n${postData?.title || ''}\n\n`);
    window.open(`https://api.whatsapp.com/send?text=${texto}${url}`, '_blank');
  }

  compartirX() {
    const url = encodeURIComponent(window.location.href);
    const postData = this.noticia();
    const texto = encodeURIComponent(`¡Nueva crónica en El Diario Inesperado!\n\n${postData?.title || ''}\n\n`);
    window.open(`https://twitter.com/intent/tweet?text=${texto}&url=${url}`, '_blank');
  }
}
