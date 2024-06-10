// translation.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})
export class TranslationService {
    private apiKey = 'TU_CLAVE_DE_API'; // Reemplaza con tu clave de API

    constructor(private http: HttpClient) { }

    async translateText(text: string, targetLanguage: string): Promise<string> {
        const apiUrl = 'https://translation.googleapis.com/language/translate/v2';
        const params = {
            key: this.apiKey,
            q: text,
            target: targetLanguage,
        };

        return this.http
            .post(apiUrl, params)
            .toPromise()
            .then((response: any) => response.data.translations[0].translatedText)
            .catch((error) => {
                console.error('Error al traducir:', error);
                return 'Error en la traducción';
            });
    }
}
