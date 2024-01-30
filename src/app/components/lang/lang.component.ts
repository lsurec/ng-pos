//Utilidades de angular
import { Component } from '@angular/core';
import { Router } from '@angular/router';
//Servicios utilizados
import { TranslateService } from '@ngx-translate/core';
import { RouteNamesService } from 'src/app/services/route.names.service';
import { PreferencesService } from 'src/app/services/preferences.service';
//Interfaces utilizadas
import { LanguageInterface } from 'src/app/interfaces/language.interface';
//Providers a utilizar
import { indexDefaultLang, languagesProvider } from 'src/app/providers/languages.provider';

@Component({
  selector: 'app-lang',
  templateUrl: './lang.component.html',
  styleUrls: ['./lang.component.scss']
})

export class LangComponent {

  //Declaracion de variables
  //Variables del lenguaje por defecto y lista completa de los idiomas disponibles
  activeLang: LanguageInterface;
  idioma: number = indexDefaultLang;
  languages: LanguageInterface[] = languagesProvider;

  constructor(
    ///Instancia de servicios y variales privadas 
    private _router: Router,
    private translate: TranslateService,
  ) {
    //Por defecto marcar el idioma español
    this.activeLang = languagesProvider[0];
  }

  //Asigna un nuevo lenguaje
  changeLang(lang: number): void {
    this.idioma = lang;
    this.activeLang = languagesProvider[lang];
    this.translate.use(this.activeLang.lang);
  };

  //Obtener nombre 
  getNameByLanguageRegion(data: LanguageInterface): string | undefined {
    const { names } = data;
    const languageRegion = names.find((item) => item.lrCode === `${this.activeLang.lang}-${this.activeLang.reg}`);
    return languageRegion ? languageRegion.name : undefined;
  };

  //Guarda las preferencias de usuario y dirige a la pantalla para Theme.
  guardar(): void {
    PreferencesService.lang = JSON.stringify(this.idioma);
    this._router.navigate([RouteNamesService.THEME]);
  }
}
