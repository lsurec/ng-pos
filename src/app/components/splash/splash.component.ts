import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { EmpresaInterface } from 'src/app/interfaces/empresa.interface';
import { EstacionInterface } from 'src/app/interfaces/estacion.interface';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { LocalSettingsService } from 'src/app/services/local-settings.service';
import { RouteNamesService } from 'src/app/services/route.names.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { ErrorInterface } from 'src/app/interfaces/error.interface';
import { RetryService } from 'src/app/services/retry.service';
import { TipoCambioService } from 'src/app/displays/prc_documento_3/services/tipo-cambio.service';
import { TipoCambioInterface } from 'src/app/displays/prc_documento_3/interfaces/tipo-cambio.interface';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss'],
  providers: [
    //Inyctar servicios
    LocalSettingsService,
    NotificationsService,
    TipoCambioService,
  ]
})
export class SplashComponent implements OnInit {

  //Lista de empresas y estaciones
  empresas: EmpresaInterface[] = [];
  estaciones: EstacionInterface[] = [];

  error?: ErrorInterface;
  showError: boolean = false;
  name = RouteNamesService.SPLASH;


  constructor(
    private _router: Router,
    private translate: TranslateService,
    private _widgetsService: NotificationsService,
    private _localSettingsService: LocalSettingsService,
    private _retryService: RetryService,
    private _tipoCambioService: TipoCambioService,
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
      this._widgetsService.openSnackbar(`${this.translate.instant('pos.alerta.configuracion')} ${user}`);
      return;
    }

    if (empresas.length == 1 && estaciones.length == 1) {
      PreferencesService.empresa = empresas[0];
      PreferencesService.estacion = estaciones[0];
      PreferencesService.imgEmpresa = empresas[0].empresa_Img;

      //Cargar tipo cambio
      let resTipoCammbio = await this._tipoCambioService.getTipoCambio(

        user,
        token,
        PreferencesService.empresa.empresa,
      );


      if (!resTipoCammbio.status) {


        this.showError = true;

        let dateNow: Date = new Date();

        this.error = {
          date: dateNow,
          description: resTipoCammbio.response,
          storeProcedure: resTipoCammbio.storeProcedure,
          url: resTipoCammbio.url,

        }

        return;
      }

      let tipoCambio: TipoCambioInterface[] = resTipoCammbio.response;

      PreferencesService.tipoCambio = tipoCambio[0].tipo_Cambio;

      this._router.navigate([RouteNamesService.HOME]);
      return;
    };

    this._router.navigate([RouteNamesService.LOCAL_CONFIG]);

  }
}
