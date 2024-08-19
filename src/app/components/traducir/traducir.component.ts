import { Component } from '@angular/core';
import { TranslationService } from 'src/app/services/prueba-traducciones.service';
import { TraducirService } from 'src/app/services/transtale.service';

@Component({
  selector: 'app-traducir',
  templateUrl: './traducir.component.html',
  styleUrls: ['./traducir.component.scss']
})
export class TraducirComponent {


  correcto: boolean = true;

  // translatedText?: string;

  // constructor(private translationService: TraducirService) { }

  traducir(text: string): string {
    if (!this.correcto) {
      return text;
    }
    return text + "correcto";
  }

  respuesta() {
    this.correcto = !this.correcto;
  }


  async traducirTexto(texto: string) {
    const res = await fetch("https://es.libretranslate.com/translate", {
      method: "POST",
      body: JSON.stringify({
        q: texto,
        source: "es",
        target: "en",
        format: "text",
        alternatives: 3,
        api_key: ""
      }),
      headers: { "Content-Type": "application/json" }
    });

  }

  translatedText: string | undefined;

  constructor(private translationService: TranslationService) { }

  async translate() {
    const originalText = 'Hello, world!'; // Texto a traducir
    const targetLanguage = 'es'; // Idioma de destino (por ejemplo, español)

    try {
      this.translatedText = await this.translationService.translateText(
        originalText,
        targetLanguage
      );
    } catch (error) {
      console.error('Error al traducir:', error);
      this.translatedText = 'Error en la traducción';
    }
  }
}