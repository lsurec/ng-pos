import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { EmpresaInterface } from 'src/app/interfaces/empresa.interface';
import { EstacionInterface } from 'src/app/interfaces/estacion.interface';
import { LanguageInterface } from 'src/app/interfaces/language.interface';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { languagesProvider, indexDefaultLang } from 'src/app/providers/languages.provider';
import { ok, salioMal } from 'src/app/providers/mensajes.provider';
import { LocalSettingsService } from 'src/app/services/local-settings.service';
import { MensajesService } from 'src/app/services/mensajes.service';
import { RouteNamesService } from 'src/app/services/route.names.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { WidgetsService } from 'src/app/services/widgets.service';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss'],
  providers: [
    //Inyctar servicios
    LocalSettingsService,
    WidgetsService,
  ]
})
export class SplashComponent {

  //Lista de empresas y estaciones
  empresas: EmpresaInterface[] = [];
  estaciones: EstacionInterface[] = [];

  constructor(
    private _router: Router,
    private translate: TranslateService,
    private _widgetsService: WidgetsService,
    private _empresa: LocalSettingsService,
    private _estacion: LocalSettingsService,
  ) {

    //Cargar Datos
    this.loadData();
  }

  async loadData(): Promise<void> {


    if (!PreferencesService.lang) {
      setTimeout(() => {
        this._router.navigate([RouteNamesService.LANGUAGE]);
      }, 1000);
      return;
    }

    if (!PreferencesService.theme) {
      setTimeout(() => {
        this._router.navigate([RouteNamesService.THEME]);
      }, 1000);
      return;
    }
    
    if (!PreferencesService.token) {
      setTimeout(() => {
        this._router.navigate([RouteNamesService.API]);
      }, 1000);
      return;
    }

    this._router.navigate([RouteNamesService.LOGIN]);


  }
}
