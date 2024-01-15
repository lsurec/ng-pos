import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ClipboardService {
  copyToClipboard(value: string): void {
    const textarea = document.createElement('textarea');
    textarea.value = value;

    // Añadir el elemento al DOM para que el método `select` funcione
    document.body.appendChild(textarea);

    // Seleccionar el texto del textarea
    textarea.select();

    try {
      // Intentar copiar al portapapeles
      document.execCommand('copy');
    } catch (err) {
      console.error('Error al intentar copiar al portapapeles', err);
    } finally {
      // Eliminar el textarea del DOM
      document.body.removeChild(textarea);
    }
  }
}
