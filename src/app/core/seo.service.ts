import { Injectable } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  constructor(
    private titleService: Title,
    private metaService: Meta
  ) {}

  generarTags(config: { title?: string; description?: string; image?: string; slug?: string }) {
    // Definimos valores por defecto
    const titleVal = config.title ? `${config.title} | El Diario Inesperado` : 'El Diario Inesperado - News & Whimsy';
    const descVal = config.description || 'Crónicas insólitas, chismes de época y aventuras del multiverso.';
    const imgVal = config.image || ''; // Imagen por defecto (string vacío por ahora)
    const urlVal = `https://eldiarioinesperado.cl${config.slug ? '/' + config.slug : ''}`;

    // Título de la pestaña
    this.titleService.setTitle(titleVal);

    // Actualización de etiquetas Meta
    this.metaService.updateTag({ name: 'description', content: descVal });
    
    // Open Graph
    this.metaService.updateTag({ property: 'og:type', content: 'website' });
    this.metaService.updateTag({ property: 'og:site_name', content: 'El Diario Inesperado' });
    this.metaService.updateTag({ property: 'og:title', content: titleVal });
    this.metaService.updateTag({ property: 'og:description', content: descVal });
    this.metaService.updateTag({ property: 'og:image', content: imgVal });
    this.metaService.updateTag({ property: 'og:url', content: urlVal });

    // Twitter Card
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
  }
}
