import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { EmpresaInterface } from 'src/app/interfaces/empresa.interface';
import { EstacionInterface } from 'src/app/interfaces/estacion.interface';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { LocalSettingsService } from 'src/app/services/local-settings.service';
import { RouteNamesService } from 'src/app/services/route.names.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { WidgetsService } from 'src/app/services/widgets.service';
import { ErrorInterface } from 'src/app/interfaces/error.interface';
import { RetryService } from 'src/app/services/retry.service';

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
export class SplashComponent implements OnInit {

  //Lista de empresas y estaciones
  empresas: EmpresaInterface[] = [];
  estaciones: EstacionInterface[] = [];

  error?: ErrorInterface;
  showError: boolean = false;

  constructor(
    private _router: Router,
    private translate: TranslateService,
    private _widgetsService: WidgetsService,
    private _localSettingsService: LocalSettingsService,
    private _retryService: RetryService,
  ) {

    //Cargar Datos
    this.loadData();

  }

  ngOnInit(): void {
    this._retryService.splash$.subscribe(() => {
      this.showError = false;
      this.loadData();
    });
  }



  async loadData(): Promise<void> {


    //Si no hay idioma configurar
    if (!PreferencesService.lang) {
      setTimeout(() => {
        this._router.navigate([RouteNamesService.LANGUAGE]);
      }, 1000);
      return;
    }

    //si no hay trema configurar
    if (!PreferencesService.theme) {
      setTimeout(() => {
        this._router.navigate([RouteNamesService.THEME]);
      }, 1000);
      return;
    }

    //si no hay url configurar
    if (!PreferencesService.baseUrl) {
      setTimeout(() => {
        this._router.navigate([RouteNamesService.API]);
      }, 1000);
      return;
    }

    //si no hay taoken configurar     
    if (!PreferencesService.tokenStorage) {
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

    //empresas y estaciones
    let empresas: EmpresaInterface[] = [];
    let estaciones: EstacionInterface[] = [];

    // //Consumo de servicios
    let resEmpresas: ResApiInterface = await this._localSettingsService.getEmpresas(user, token);
    //Si el servico se ejecuta mal mostar mensaje
    if (!resEmpresas.status) {

      this.showError = true;

      let dateNow: Date = new Date();

      this.error = {
        date: dateNow,
        description: resEmpresas.response,
        storeProcedure: resEmpresas.storeProcedure,
        url: resEmpresas.url,

      }

      return;
    }

    //Guardar Emoresas obtenidas
    empresas = resEmpresas.response;

    let resEstacion: ResApiInterface = await this._localSettingsService.getEstaciones(user, token);



    if (!resEstacion.status) {


      this.showError = true;

      let dateNow: Date = new Date();

      this.error = {
        date: dateNow,
        description: resEstacion.response,
        storeProcedure: resEstacion.storeProcedure,
        url: resEstacion.url,

      }

      return;
    }

    estaciones = resEstacion.response;

    if (estaciones.length == 0 || empresas.length == 0) {
      this._router.navigate([RouteNamesService.LOCAL_CONFIG]);

      //TODO:translate
      this._widgetsService.openSnackbar(`No se encontraron empresas o estaciones de trabajo para el usuario: ${user}`);
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
