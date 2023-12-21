import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LanguageInterface } from 'src/app/interfaces/language.interface';
import { indexDefaultLang, languagesProvider } from 'src/app/providers/languages.provider';
import { RouteNamesService } from 'src/app/services/route.names.service';
import { StorageService } from 'src/app/services/storage.service';
import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'app-theme',
  templateUrl: './theme.component.html',
  styleUrls: ['./theme.component.scss']
})
export class ThemeComponent {
  ///LENGUAJES: Opciones lenguajes
  activeLang: LanguageInterface;
  idioma: number = indexDefaultLang;
  languages: LanguageInterface[] = languagesProvider;
  temaOscuro: boolean = false;
  tema: number = 0;

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

  }

  ngOnInit(): void {

    if (StorageService.tema == '1') {
      this.tema = 1;
    }
  };

  claro(idTema: number): void {
    this.tema = idTema;
    this.themeService.isDarkTheme = false;
    this.themeService.updateTheme();
    StorageService.tema = "0";
  }

  oscuro(idTema: number): void {
    this.tema = idTema;
    this.themeService.isDarkTheme = true;
    this.themeService.updateTheme();
    StorageService.tema = "1";
  }

  guardar(): void {
    this._router.navigate([RouteNamesService.API]);
  }
}
