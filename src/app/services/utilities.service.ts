// shared.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})

//eventos para pantalla volver a cargar
export class UtilitiesService {


    //convierte un string a numero si es valido
    static convertirTextoANumero(texto: string): number | null {
        // Verificar si la cadena es un número
        const esNumero = /^\d+(\.\d+)?$/.test(texto);

        if (esNumero) {
            // Realizar la conversión a número
            return parseFloat(texto);
            // Si quieres convertir a un número entero, puedes usar parseInt(texto) en lugar de parseFloat.
        } else {
            // Retornar null si la cadena no es un número
            return null;
        }
    }


}
