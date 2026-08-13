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
      // Breve pausa para asegurar que el DOM esté completamente renderizado
      await new Promise(resolve => setTimeout(resolve, 150));

      const element = this.socialCardContainer.nativeElement;

      // Capturamos el elemento tal como se ve en la vista previa a escala 2x para nitidez HD
      const canvas = await html2canvas(element, {
        useCORS: true,
        scale: 2,
        allowTaint: false,
        backgroundColor: null,
        logging: false
      });

      canvas.toBlob((blob) => {
        if (blob) {
          this.graphicGenerated.emit(blob);

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
      console.error('Error al capturar la gráfica con html2canvas:', error);
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
