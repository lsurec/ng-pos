// shared.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})

//eventos para pantalla volver a cargar
export class UtilitiesService {

    static async generatePdfBlob(pdfDocGenerator: { getBlob: (arg0: (blob: any) => void) => void; }): Promise<Blob> {
        return new Promise((resolve, reject) => {
            pdfDocGenerator.getBlob((blob) => {
                if (blob) {
                    resolve(blob);  // Resolviendo la promesa con el blob
                } else {
                    reject('Error al generar el PDF');
                }
            });
        });
    }


    static isEqualDate(fechaInicio: Date, fechaFinal: Date) {
        const fecha1SinHora: Date = new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), fechaInicio.getDate());
        const fecha2SinHora: Date = new Date(fechaFinal.getFullYear(), fechaFinal.getMonth(), fechaFinal.getDate());

        // Comparar las fechas sin hora, minutos y segundos
        if (fecha1SinHora > fecha2SinHora) {
            return false;
        } else if (fecha1SinHora < fecha2SinHora) {
            return false;
        } else {
            return true;
        }
    }

    static compareDate(fechaInicio: Date, fechaFin: Date) {
        const fecha1SinHora: Date = new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), fechaInicio.getDate());
        const fecha2SinHora: Date = new Date(fechaFin.getFullYear(), fechaFin.getMonth(), fechaFin.getDate());

        return fecha1SinHora > fecha2SinHora ? true : false;
    }

    static minorDateWithoutSeconds(date1: Date, date2: Date): boolean {
        // Crear nuevas instancias de fechas sin segundos
        const dateWithoutSeconds1 = new Date(date1);
        dateWithoutSeconds1.setSeconds(0, 0);

        const dateWithoutSeconds2 = new Date(date2);
        dateWithoutSeconds2.setSeconds(0, 0);

        // Comparar las fechas
        return dateWithoutSeconds1 < dateWithoutSeconds2 ? true : false;

    }

    static majorDateWithoutSeconds(date1: Date, date2: Date): boolean {
        // Crear nuevas instancias de fechas sin segundos
        const dateWithoutSeconds1 = new Date(date1);
        dateWithoutSeconds1.setSeconds(0, 0);

        const dateWithoutSeconds2 = new Date(date2);
        dateWithoutSeconds2.setSeconds(0, 0);

        // Comparar las fechas
        return dateWithoutSeconds1 > dateWithoutSeconds2 ? true : false;

    }

    static majorOrEqualDateWithoutSeconds(date1: Date, date2: Date): boolean {
        // Crear nuevas instancias de fechas sin segundos
        const dateWithoutSeconds1 = new Date(date1);
        dateWithoutSeconds1.setSeconds(0, 0);

        const dateWithoutSeconds2 = new Date(date2);
        dateWithoutSeconds2.setSeconds(0, 0);

        // Comparar las fechas
        return dateWithoutSeconds1 >= dateWithoutSeconds2 ? true : false;

    }

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



    //formatear la hora con una fecha ingresada.
    static getHoraInput(horaSelected: Date): string {
        // Obtener la hora actual y formatearla como deseas
        let hora = new Date(horaSelected);
        let horas = hora.getHours();
        let minutos = hora.getMinutes();
        let ampm = horas >= 12 ? 'pm' : 'am';
        // Formatear la hora actual como 'hh:mm am/pm'
        return `${horas % 12 || 12}:${minutos < 10 ? '0' : ''}${minutos} ${ampm}`;
    };

    static getStructureDate(date: Date) {
        return {
            year: date.getFullYear(),
            day: date.getDate(),
            month: date.getMonth() + 1,
        }
    }

}
