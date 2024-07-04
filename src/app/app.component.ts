import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PreferencesService } from './services/preferences.service';
import { LanguageInterface } from './interfaces/language.interface';
import { languagesProvider, indexDefaultLang } from './providers/languages.provider';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {

  //Idiomas disponibles para la aplicacion
  languages: LanguageInterface[] = languagesProvider;
  activeLang: LanguageInterface;
  idioma: number = indexDefaultLang;

  constructor(
    private translate: TranslateService,
    private _themeService: ThemeService,

  ) {
    //Buscar y obtener el leguaje guardado en el servicio  
    let getLanguage = PreferencesService.lang;
    if (!getLanguage) {
      this.activeLang = languagesProvider[indexDefaultLang];
      this.translate.setDefaultLang(this.activeLang.lang);
    } else {
      //sino se encuentra asignar el idioma por defecto
      this.idioma = +getLanguage;
      this.activeLang = languagesProvider[this.idioma];
      this.translate.setDefaultLang(this.activeLang.lang);
    };

    //buscar y asignar tema
    if (PreferencesService.theme == '1') {
      this._themeService.isDarkTheme = true;
      this._themeService.updateTheme();
    }

    //tamaño de fuente
    let getFontSize: string = PreferencesService.fontSizeStorage;

    if (!getFontSize) {
      _themeService.globalFontSize = "14px";
    } else {
      _themeService.globalFontSize = getFontSize;
    }

    //color de fondo
    let getColorFondo: string = PreferencesService.fondoApp;

    if (!getColorFondo) {
      _themeService.fondo = "#FEF5E7";
    } else {
      _themeService.fondo = getColorFondo;
    }

    //color de fondo
    let getColor: string = PreferencesService.colorApp;

    if (!getColor) {
      _themeService.color = "#134895";
    } else {
      _themeService.color = getColor;
    }

  }

  ngOnInit(): void {
    // Obtener el valor de globalFontSize del servicio y establecerlo como una variable CSS
    document.documentElement.style.setProperty('--global-font-size', this._themeService.globalFontSize);
    document.documentElement.style.setProperty('--global-color-fondo', this._themeService.fondo);
    document.documentElement.style.setProperty('--global-color', this._themeService.color);

  }

}
