import { Injectable } from '@angular/core';
import { NgbDatepickerI18n, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { indexDefaultLang, languagesProvider } from '../providers/languages.provider';
import { PreferencesService } from './preferences.service';

// Define la interfaz para representar los datos de idioma
interface LanguageData {
    weekdays: string[];
    months: string[];
}

@Injectable({
    providedIn: 'root',
})
export class CustomDatepickerI18n extends NgbDatepickerI18n {
    language: string;
    constructor() {
        super();
        // Define el idioma predeterminado

        if (!PreferencesService.lang) {
            this.language = languagesProvider[indexDefaultLang].lang;
        } else {
            this.language = languagesProvider[+PreferencesService.lang].lang;
        }
    }

    // Define el método para establecer el idioma
    setLanguage(language: string) {
        this.language = language;
        this.getLanguageData(language);
    }

    // Implementa los métodos de la interfaz NgbDatepickerI18n
    getWeekdayShortName(weekday: number): string {
        return this.getLanguageData(this.language).weekdays[weekday - 1];
    }

    getMonthShortName(month: number): string {
        return this.getLanguageData(this.language).months[month - 1];
    }

    getMonthFullName(month: number): string {
        return this.getMonthShortName(month);
    }

    getDayAriaLabel(date: NgbDateStruct): string {
        return `${date.day}-${date.month}-${date.year}`;
    }

    getWeekdayLabel(weekday: number): string {
        return this.getLanguageData(this.language).weekdays[weekday - 1];
    }

    // Método privado para obtener los datos del idioma actual
    private getLanguageData(lang: string): LanguageData {
        return I18N_VALUES[lang];
    }
}

// Define el objeto de valores de idioma con la interfaz LanguageData
const I18N_VALUES: { [key: string]: LanguageData } = {
    es: {
        weekdays: ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'],
        months: [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ]
    },
    en: {
        weekdays: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
        months: [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ]
    },
    fr: {
        weekdays: ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"],
        months: [
            "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
            "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
        ]
    },
    de: {
        weekdays: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"],
        months: [
            "Januar", "Februar", "März", "April", "Mai", "Juni",
            "Juli", "August", "September", "Oktober", "November", "Dezember"
        ]
    }
    // Puedes agregar más idiomas aquí
};
