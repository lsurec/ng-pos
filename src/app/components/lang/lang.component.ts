import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LanguageInterface } from 'src/app/interfaces/language.interface';
import { indexDefaultLang, languagesProvider } from 'src/app/providers/languages.provider';
import { RouteNamesService } from 'src/app/services/route.names.service';
import { PreferencesService } from 'src/app/services/preferences.service';

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
    private _router: Router,

  ) {
    
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

  guardar() {
    PreferencesService.lang = JSON.stringify(this.idioma);
    this._router.navigate([RouteNamesService.THEME]);
  }
}
