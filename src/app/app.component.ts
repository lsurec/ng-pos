import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PreferencesService } from './services/preferences.service';
import { LanguageInterface } from './interfaces/language.interface';
import { languagesProvider, indexDefaultLang } from './providers/languages.provider';
import { ThemeService } from './services/theme.service';
import { PrinterService } from './services/printer.service';
import { ResApiInterface } from './interfaces/res-api.interface';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers:[PrinterService]
})
export class AppComponent {

  //Idiomas disponibles para la aplicacion
  languages: LanguageInterface[] = languagesProvider;
  activeLang: LanguageInterface;
  idioma: number = indexDefaultLang;

  constructor(
    private translate: TranslateService,
    private _themeService: ThemeService,
    private _printerService:PrinterService,
  ) {
    

    this.loadData();

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

  }

  async loadData(){
    let resApi:ResApiInterface =  await this._printerService.getPrinters();
    console.log(resApi.response);
    
  }

  
}
