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
    private _localSettingsService: LocalSettingsService,
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

    if (!PreferencesService.baseUrl) {
      setTimeout(() => {
        this._router.navigate([RouteNamesService.API]);
      }, 1000);
      return;
    }

    
    if (!PreferencesService.token) {
      setTimeout(() => {
        this._router.navigate([RouteNamesService.LOGIN]);
      }, 1000);
      return;
    }

    //Buscar empresas y estaciones

    PreferencesService.user = PreferencesService.userStorage;
    PreferencesService.token = PreferencesService.tokenStorage;
    PreferencesService.conStr = PreferencesService.conStorageStr;

    let user = PreferencesService.user;
    let token = PreferencesService.token;

    // //Consumo de servicios
    let resEmpresas: ResApiInterface = await this._localSettingsService.getEmpresas(user, token);
    //Si el servico se ejecuta mal mostar mensaje
    if (!resEmpresas.status) {
      //TODO: Error view
      this._router.navigate([RouteNamesService.LOCAL_CONFIG]);

      this._widgetsService.openSnackbar(this.translate.instant('pos.alertas.salioMal'), this.translate.instant('pos.alertas.ok'));
      console.error(resEmpresas.response);
      console.error(resEmpresas.storeProcedure);

      return;
    }

    //empresas y estaciones
    let empresas: EmpresaInterface[] = [];
    let estaciones: EstacionInterface[] = [];


    //Guardar Emoresas obtenidas
    empresas = resEmpresas.response;

    let resEstacion: ResApiInterface = await this._localSettingsService.getEstaciones(user, token);


    if (!resEstacion.status) {
      this._router.navigate([RouteNamesService.LOCAL_CONFIG]);

      //TODO: Error view
      this._widgetsService.openSnackbar(this.translate.instant('pos.alertas.salioMal'), this.translate.instant('pos.alertas.ok'));
      console.error(resEstacion.response);
      console.error(resEstacion.storeProcedure);

      return;
    }

    estaciones = resEstacion.response;

    if (estaciones.length == 0 || empresas.length == 0) {
      this._router.navigate([RouteNamesService.LOCAL_CONFIG]);

      //TODO:translate
      this._widgetsService.openSnackbar(`No se encontraron empresas o estaciones de trabajo para el usuario: ${user}`, "Ok");
      return;
    }

    if (empresas.length == 1 && estaciones.length == 1) {
      PreferencesService.empresa = empresas[0];
      PreferencesService.estacion = estaciones[0];

      this._router.navigate([RouteNamesService.HOME]);
      return;
    };

    this._router.navigate([RouteNamesService.LOCAL_CONFIG]);

  }
}
