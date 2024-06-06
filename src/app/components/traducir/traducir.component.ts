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


  // translateText(text: string): string {
  //   this.translationService.translate(text).subscribe(
  //     (response) => {
  //       // Maneja la respuesta aquí
  //       let translatedText: string = response.data.translations[0].translatedText;
  //       console.log('Texto traducido:', translatedText);
  //       return translatedText;
  //     },
  //     (error) => {
  //       console.error('Error al traducir:', error);
  //       return text;
  //     }
  //   );

  //   return text;
  // }

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

    console.log(await res.json());
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