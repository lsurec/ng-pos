import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { EmpresaInterface } from 'src/app/interfaces/empresa.interface';
import { EstacionInterface } from 'src/app/interfaces/estacion.interface';
import { LanguageInterface } from 'src/app/interfaces/language.interface';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { indexDefaultLang, languagesProvider } from 'src/app/providers/languages.provider';
import { LocalSettingsService } from 'src/app/services/local-settings.service';
import { RouteNamesService } from 'src/app/services/route.names.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { ErrorInterface } from 'src/app/interfaces/error.interface';
import { RetryService } from 'src/app/services/retry.service';
import { TipoCambioService } from 'src/app/displays/prc_documento_3/services/tipo-cambio.service';
import { TipoCambioInterface } from 'src/app/displays/prc_documento_3/interfaces/tipo-cambio.interface';

@Component({
  selector: 'app-local-config',
  templateUrl: './local-config.component.html',
  styleUrls: ['./local-config.component.scss'],
  providers: [
    //inyeccion de servicios
    LocalSettingsService,
    NotificationsService,
    LocalSettingsService,
    TipoCambioService,
  ]
})
export class LocalConfigComponent implements OnInit {
  //Declaracion de variables
  nonSelect: string = ''; //frase que indica que no se ha seleccionado empresa o estacion
  isLoading: boolean = false; //pantalla de carga
  showError: boolean = false;

  //empresas y estaciones
  empresas: EmpresaInterface[] = [];
  estaciones: EstacionInterface[] = [];

  //empresa seleccionada y estacion seleccionada
  empresaSelect?: EmpresaInterface;
  estacionSelect?: EstacionInterface;


  regresar: boolean = true;

  //Idiomas disponibles de la aplicacion
  languages: LanguageInterface[] = languagesProvider;
  idioma: number = indexDefaultLang;

  error?: ErrorInterface;
  name = RouteNamesService.LOCAL_CONFIG;

  constructor(
    //Instancia de servicios a utilizar
    private _router: Router,
    private translate: TranslateService,
    private _notificationsService: NotificationsService,
    private _localSettingsService: LocalSettingsService,
    private _retryService: RetryService,
    private _tipoCambioService: TipoCambioService,

  ) {

  }
  ngOnInit(): void {
    this.loadData();

    this._retryService.config$.subscribe(() => {
      this.showError = false;
      this.loadData();
    });
  }

  async loadData() {
    let user = PreferencesService.user;
    let token = PreferencesService.token;


    this.isLoading = true;
    // //Consumo de servicios
    let resEmpresas: ResApiInterface = await this._localSettingsService.getEmpresas(user, token);
    //Si el servico se ejecuta mal mostar mensaje
    if (!resEmpresas.status) {

      this.isLoading = false;
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
    this.empresas = resEmpresas.response;

    let resEstacion: ResApiInterface = await this._localSettingsService.getEstaciones(user, token);

    this.isLoading = false;

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

    this.estaciones = resEstacion.response;


    if (this.estaciones.length == 1) {
      this.estacionSelect = this.estaciones[0];
    }

    if (this.empresas.length == 1) {
      this.empresaSelect = this.empresas[0];
    }

  }


  async saveSettings() {


    //Validar que se seleccione empresa y estacion
    if (!this.empresaSelect || !this.estacionSelect) {
      this._notificationsService.openSnackbar(this.translate.instant('pos.alertas.debeSeleccionar'));
      return;
    };

    //Guardar empresa y estacion seleccionada en el Storage y navegar a Home

    PreferencesService.empresa = this.empresaSelect;
    PreferencesService.estacion = this.estacionSelect;


    let user = PreferencesService.user;
    let token = PreferencesService.token;

    this.isLoading = true;

    //Cargar tipo cambio
    let resTipoCammbio = await this._tipoCambioService.getTipoCambio(
      user,
      token,
      PreferencesService.empresa.empresa,
    );

    this.isLoading = false;

    if (!resTipoCammbio.status) {

      this.isLoading = false;
      this._notificationsService.showErrorAlert(resTipoCammbio);
      return;
    }

    let tipoCambio: TipoCambioInterface[] = resTipoCammbio.response;

    PreferencesService.tipoCambio = tipoCambio[0].tipo_Cambio;

    this._router.navigate([RouteNamesService.HOME]);
  }

  async cerrarSesion() {
    //Cerrar sesion
    this._notificationsService.showCloseSesionDialog();
  }

}
