// shared.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})

//eventos para pantalla volver a cargar
export class UtilitiesService {

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

    static getFechaCompleta(date: Date): string {
        // Crear una nueva instancia de Date a partir de horaSelected
        let fecha: Date = new Date(date);

        // Obtener los componentes de la fecha y hora
        let dia: number = fecha.getDate();
        let mes: number = fecha.getMonth() + 1; // Los meses en JavaScript son de 0 a 11
        let anio: number = fecha.getFullYear();
        let horas: number = fecha.getHours();
        let minutos: number = fecha.getMinutes();

        // Formatear día y mes para que siempre tengan dos dígitos
        let diaStr: string = dia < 10 ? '0' + dia : dia.toString();
        let mesStr: string = mes < 10 ? '0' + mes : mes.toString();
        let minutosStr: string = minutos < 10 ? '0' + minutos : minutos.toString();

        // Devolver la fecha y hora en el formato deseado
        return `${diaStr}/${mesStr}/${anio} ${horas}:${minutosStr}`;
    }


}
