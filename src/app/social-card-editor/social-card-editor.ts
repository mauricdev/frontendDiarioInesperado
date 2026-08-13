import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectorRef, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-social-card-editor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './social-card-editor.html',
  styleUrl: './social-card-editor.scss'
})
export class SocialCardEditor implements AfterViewInit {
  @Input() imageUrl: string = '';
  @Input() title: string = '';
  @Input() authorName: string = '';

  @Output() graphicGenerated = new EventEmitter<Blob>();

  @ViewChild('viewport', { static: false }) viewport!: ElementRef;
  @ViewChild('socialCardContainer', { static: false }) socialCardContainer!: ElementRef;

  isGenerating = false;
  previewGeneratedUrl: string | null = null;
  scaleFactor: number = 0.5;

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    setTimeout(() => this.updateScale(), 50);
  }

  @HostListener('window:resize')
  onResize() {
    this.updateScale();
  }

  updateScale() {
    if (this.viewport && this.viewport.nativeElement) {
      const containerWidth = this.viewport.nativeElement.offsetWidth;
      // 1200px es el ancho base fijo HD de la tarjeta
      this.scaleFactor = containerWidth / 1200;
      this.cdr.detectChanges();
    }
  }

  async generarGrafica() {
    if (!this.socialCardContainer) {
      console.error('El contenedor de la tarjeta no está disponible en el DOM.');
      return;
    }

    this.isGenerating = true;
    this.cdr.detectChanges();

    try {
      const element = this.socialCardContainer.nativeElement as HTMLElement;
      
      // Guardamos la escala actual y la reseteamos a 1 (1200x675 nativo) para capturar en HD
      const originalTransform = element.style.transform;
      element.style.transform = 'none';

      await new Promise(resolve => setTimeout(resolve, 150));

      const canvas = await html2canvas(element, {
        useCORS: true,
        width: 1200,
        height: 675,
        scale: 1,
        allowTaint: false,
        backgroundColor: null,
        logging: false
      });

      // Restauramos la escala visual responsiva para la vista del panel
      element.style.transform = originalTransform;

      canvas.toBlob((blob) => {
        if (blob) {
          this.graphicGenerated.emit(blob);

          if (this.previewGeneratedUrl) {
            URL.revokeObjectURL(this.previewGeneratedUrl);
          }
          this.previewGeneratedUrl = URL.createObjectURL(blob);
          console.log('¡Gráfica HD (1200x675) generada con éxito!', blob);
        } else {
          console.error('Error al generar el Blob del canvas.');
        }
        this.isGenerating = false;
        this.cdr.detectChanges();
      }, 'image/png');

    } catch (error) {
      console.error('Error al capturar la tarjeta con html2canvas:', error);
      this.isGenerating = false;
      this.cdr.detectChanges();
    }
  }

  resetPreview() {
    if (this.previewGeneratedUrl) {
      URL.revokeObjectURL(this.previewGeneratedUrl);
      this.previewGeneratedUrl = null;
    }
  }
}
