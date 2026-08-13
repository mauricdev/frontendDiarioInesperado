import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-social-card-editor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './social-card-editor.html',
  styleUrl: './social-card-editor.scss'
})
export class SocialCardEditor {
  @Input() imageUrl: string = '';
  @Input() title: string = '';
  @Input() authorName: string = '';

  @Output() graphicGenerated = new EventEmitter<Blob>();

  @ViewChild('socialCardContainer', { static: false }) socialCardContainer!: ElementRef;

  isGenerating = false;
  previewGeneratedUrl: string | null = null;

  constructor(private cdr: ChangeDetectorRef) {}

  async generarGrafica() {
    if (!this.socialCardContainer) {
      console.error('El contenedor de la tarjeta no está disponible en el DOM.');
      return;
    }

    this.isGenerating = true;
    this.cdr.detectChanges();

    try {
      // Breve pausa para dar tiempo al navegador de renderizar cambios en el DOM
      await new Promise(resolve => setTimeout(resolve, 300));

      const element = this.socialCardContainer.nativeElement;
      const canvas = await html2canvas(element, {
        useCORS: true,        // Permitir la carga de imágenes con CORS (Unsplash)
        scale: 2,             // Aumentar la resolución para un renderizado nítido
        allowTaint: false,
        backgroundColor: null
      });

      canvas.toBlob((blob) => {
        if (blob) {
          // Emitimos el Blob al padre
          this.graphicGenerated.emit(blob);

          // Creamos una URL de previsualización interna para mostrarla en el panel
          if (this.previewGeneratedUrl) {
            URL.revokeObjectURL(this.previewGeneratedUrl);
          }
          this.previewGeneratedUrl = URL.createObjectURL(blob);
          console.log('¡Gráfica generada con éxito!', blob);
        } else {
          console.error('Error al generar el Blob del canvas.');
        }
        this.isGenerating = false;
        this.cdr.detectChanges();
      }, 'image/png');

    } catch (error) {
      console.error('Error al capturar el elemento con html2canvas:', error);
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
