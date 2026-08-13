import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
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
    this.http.get<any>(`${environment.apiUrl}/posts/${id}`).subscribe({
      next: async (data) => {
        this.noticia.set(data);
        this.historia = data;
        const rawHtml = await marked.parse(data.content || '');
        const cleanHtml = DOMPurify.sanitize(rawHtml);
        this.parsedContent.set(cleanHtml);

        // Generar slug amigable para el SEO
        const slugTitle = data.title
          ? data.title.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '')
          : 'noticia';

        // Inyectamos el SEO dinámico completo mediante SeoService
        this.seoService.setSeoData({
          title: data.title,
          description: data.socialSummary || data.description,
          image: data.imageUrl,
          slug: `cronica/${data.id}/${slugTitle}`,
          author: data.author,
          publishedAt: data.createdAt
        });

        console.log('Detalle de noticia cargado e indexado:', data);
      },
      error: (err) => {
        console.error('Error al cargar detalle de noticia:', err);
      }
    });
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
