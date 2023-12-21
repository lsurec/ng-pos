import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LanguageInterface } from 'src/app/interfaces/language.interface';
import { indexDefaultLang, languagesProvider } from 'src/app/providers/languages.provider';
import { RouteNamesService } from 'src/app/services/route.names.service';
import { StorageService } from 'src/app/services/storage.service';
import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'app-lang',
  templateUrl: './lang.component.html',
  styleUrls: ['./lang.component.scss']
})
export class LangComponent {
  activeLang: LanguageInterface;
  idioma: number = indexDefaultLang;
  languages: LanguageInterface[] = languagesProvider;
  temaOscuro: boolean = false;

  constructor(
    private translate: TranslateService,
    private themeService: ThemeService,
    private _router: Router,

  ) {
    //Buscar y obtener el leguaje guardado en el servicio  
    let getLanguage = StorageService.laguageActive;
    if (!getLanguage) {
      this.activeLang = languagesProvider[indexDefaultLang];
      this.translate.setDefaultLang(this.activeLang.lang);
    } else {
      //sino se encuentra asignar el idioma por defecto
      this.idioma = +getLanguage;
      this.activeLang = languagesProvider[this.idioma];
      this.translate.setDefaultLang(this.activeLang.lang);
    };

    this.temaOscuro = themeService.isDarkTheme;

  }

  //Asigna un nuevo lenguaje
  changeLang(lang: number): void {
    this.idioma = lang;
    this.activeLang = languagesProvider[lang];
    this.translate.use(this.activeLang.lang);
    StorageService.laguageActive = JSON.stringify(lang);
  };

  //Obtener nombre 
  getNameByLanguageRegion(data: LanguageInterface): string | undefined {
    const { names } = data;
    const languageRegion = names.find((item) => item.lrCode === `${this.activeLang.lang}-${this.activeLang.reg}`);
    return languageRegion ? languageRegion.name : undefined;
  };

  guardar() {
    this._router.navigate([RouteNamesService.THEME]);
  }
}
