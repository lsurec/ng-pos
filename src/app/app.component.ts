import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PreferencesService } from './services/preferences.service';
import { LanguageInterface } from './interfaces/language.interface';
import { languagesProvider, indexDefaultLang } from './providers/languages.provider';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {

  //Idiomas disponibles de la aplicacion
  languages: LanguageInterface[] = languagesProvider;
  activeLang: LanguageInterface;
  idioma: number = indexDefaultLang;

  constructor(
    private translate: TranslateService
  ) {
    // localStorage.clear();
    // sessionStorage.clear();
    //TODO:Elimminar
    PreferencesService.baseUrl = "https://ds.demosoftonline.com/host/la_carreta/POSApis/api"

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

  }

  
}
