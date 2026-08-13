import { Injectable, Inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  private readonly DEFAULT_TITLE = 'El Diario Inesperado | Crónicas Insólitas y Noticias Satíricas';
  private readonly DEFAULT_DESC = 'Crónicas insólitas, chismes de época y aventuras del multiverso en El Diario Inesperado.';
  private readonly DEFAULT_IMAGE = 'https://eldiarioinesperado.cl/assets/social-card-default.png';
  private readonly BASE_URL = 'https://eldiarioinesperado.cl';

  constructor(
    private titleService: Title,
    private metaService: Meta,
    @Inject(DOCUMENT) private dom: Document
  ) {}

  setSeoData(config: { title?: string; description?: string; image?: string; slug?: string; author?: string; publishedAt?: string }) {
    const fullTitle = config.title ? `${config.title} | El Diario Inesperado` : this.DEFAULT_TITLE;
    const description = config.description || this.DEFAULT_DESC;
    const imageUrl = config.image || this.DEFAULT_IMAGE;
    const canonicalUrl = config.slug ? `${this.BASE_URL}/${config.slug}` : this.BASE_URL;

    // 1. Título de la pestaña
    this.titleService.setTitle(fullTitle);

    // 2. Meta Tags Estándar
    this.metaService.updateTag({ name: 'description', content: description });
    this.metaService.updateTag({ name: 'author', content: config.author || 'El Diario Inesperado' });
    this.metaService.updateTag({ name: 'robots', content: 'index, follow' });

    // 3. Open Graph (Facebook, WhatsApp, LinkedIn)
    this.metaService.updateTag({ property: 'og:site_name', content: 'El Diario Inesperado' });
    this.metaService.updateTag({ property: 'og:type', content: config.slug ? 'article' : 'website' });
    this.metaService.updateTag({ property: 'og:title', content: fullTitle });
    this.metaService.updateTag({ property: 'og:description', content: description });
    this.metaService.updateTag({ property: 'og:image', content: imageUrl });
    this.metaService.updateTag({ property: 'og:image:width', content: '1200' });
    this.metaService.updateTag({ property: 'og:image:height', content: '630' });
    this.metaService.updateTag({ property: 'og:url', content: canonicalUrl });

    // 4. Twitter Cards
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: fullTitle });
    this.metaService.updateTag({ name: 'twitter:description', content: description });
    this.metaService.updateTag({ name: 'twitter:image', content: imageUrl });

    // 5. Inyección de URL Canónica
    this.updateCanonicalUrl(canonicalUrl);

    // 6. Inyección de Datos Estructurados (Schema.org JSON-LD para Google News)
    if (config.slug && config.title) {
      this.injectSchemaOrgJsonLd(config);
    }
  }

  // Compatibilidad con firma anterior
  generarTags(config: { title?: string; description?: string; image?: string; slug?: string }) {
    this.setSeoData(config);
  }

  private updateCanonicalUrl(url: string) {
    let link: HTMLLinkElement | null = this.dom.querySelector("link[rel='canonical']");
    if (!link) {
      link = this.dom.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.dom.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private injectSchemaOrgJsonLd(config: any) {
    let script = this.dom.querySelector("script[type='application/ld+json']");
    if (!script) {
      script = this.dom.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      this.dom.head.appendChild(script);
    }

    const schemaData = {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      'headline': config.title,
      'description': config.description,
      'image': [config.image || this.DEFAULT_IMAGE],
      'datePublished': config.publishedAt || new Date().toISOString(),
      'author': {
        '@type': 'Person',
        'name': config.author || 'Redacción'
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'El Diario Inesperado',
        'logo': {
          '@type': 'ImageObject',
          'url': `${this.BASE_URL}/assets/logo.png`
        }
      }
    };

    script.textContent = JSON.stringify(schemaData);
  }
}
