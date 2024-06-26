//Utilidades de angular.
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
//Sercicios utilzados
import { TranslateService } from '@ngx-translate/core';
import { RetryService } from 'src/app/services/retry.service';
import { RouteNamesService } from 'src/app/services/route.names.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { LocalSettingsService } from 'src/app/services/local-settings.service';
import { TipoCambioService } from 'src/app/displays/prc_documento_3/services/tipo-cambio.service';
import { TipoCambioInterface } from 'src/app/displays/prc_documento_3/interfaces/tipo-cambio.interface';
//Interfaces utilizadas
import { ErrorInterface } from 'src/app/interfaces/error.interface';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { EmpresaInterface } from 'src/app/interfaces/empresa.interface';
import { EstacionInterface } from 'src/app/interfaces/estacion.interface';
import { LanguageInterface } from 'src/app/interfaces/language.interface';
//Providers utilizados
import { indexDefaultLang, languagesProvider } from 'src/app/providers/languages.provider';

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

  //Idiomas disponibles de la aplicacion
  languages: LanguageInterface[] = languagesProvider;
  idioma: number = indexDefaultLang;

  error?: ErrorInterface; //Guardar error
  name: string = RouteNamesService.LOCAL_CONFIG; //identificador de pantalla, para saber desde que pantalla se esta regresando.

  constructor(
    //Instancia de servicios a utilizar
    private _router: Router,
    private _retryService: RetryService,
    private _translate: TranslateService,
    private _tipoCambioService: TipoCambioService,
    private _notificationsService: NotificationsService,
    private _localSettingsService: LocalSettingsService,
  ) {

  }

  //Activa evento 
  ngOnInit(): void {
    this.loadData();

    this._retryService.config$.subscribe(() => {
      this.showError = false;
      this.loadData();
    });
  }

  //Consumir servicios de empresas y estaciones
  async loadData(): Promise<void> {
    //Usuario y token para realizar el consumo
    let user: string = PreferencesService.user;
    let token: string = PreferencesService.token;

    this.empresaSelect = undefined;
    this.estacionSelect = undefined;

    //cargar pantalla
    this.isLoading = true;
    //Consumo de servicios
    let resEmpresas: ResApiInterface = await this._localSettingsService.getEmpresas(user, token);
    //Si el servico se ejecuta mal mostar mensaje
    if (!resEmpresas.status) {

      this.isLoading = false; //detener la pantalla de carga
      this.showError = true; //ver el error

      let dateNow: Date = new Date(); //fecha del error

      //crear error
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

    //Consumo del servicio de Estaciones de trabajo.
    let resEstacion: ResApiInterface = await this._localSettingsService.getEstaciones(user, token);

    this.isLoading = false; //cargar pantalla

    if (!resEstacion.status) {
      this.showError = true; //ver el error

      let dateNow: Date = new Date(); //fecha del error

      //crear error
      this.error = {
        date: dateNow,
        description: resEstacion.response,
        storeProcedure: resEstacion.storeProcedure,
        url: resEstacion.url,
      }

      return;
    }

    //Guardar las estaciones de trabajo
    this.estaciones = resEstacion.response;

    //Si solo hay una empresa disponible seleccionarla por defecto
    if (this.estaciones.length == 1) {
      this.estacionSelect = this.estaciones[0];
    }

    //Si solo hay una estacion de trabajo disponible seleccionarla por defecto
    if (this.empresas.length == 1) {
      this.empresaSelect = this.empresas[0];
      PreferencesService.imgEmpresa = this.empresas[0].empresa_Img;
    }

    this.requerido = false;

  }

  requerido: boolean = false;

  //Guardar la configuracion seleccionada
  async saveSettings(): Promise<void> {

    //Validar que se seleccione empresa y estacion
    if (!this.empresaSelect || !this.estacionSelect) {
      this._notificationsService.openSnackbar(this._translate.instant('pos.alertas.debeSeleccionar'));
      this.requerido = true;
      return;
    };

    //Guardar empresa y estacion seleccionada en el Storage y navegar a Home
    PreferencesService.empresa = this.empresaSelect;
    PreferencesService.estacion = this.estacionSelect;
    PreferencesService.imgEmpresa = this.empresaSelect.empresa_Img;


    let user: string = PreferencesService.user;
    let token: string = PreferencesService.token;

    this.isLoading = true; //cargar pantalla

    //Cargar tipo cambio
    let resTipoCammbio = await this._tipoCambioService.getTipoCambio(
      user,
      token,
      PreferencesService.empresa.empresa,
    );

    this.isLoading = false; //detener la carga de la pantalla

    if (!resTipoCammbio.status) {
      this.isLoading = false; //detener la carga de la pantalla
      this._notificationsService.showErrorAlert(resTipoCammbio);
      return;
    }

    //Tipo de cambio que existe.
    let tipoCambio: TipoCambioInterface[] = resTipoCammbio.response;
    //lo guarda en las preferencias del usuario.
    PreferencesService.tipoCambio = tipoCambio[0].tipo_Cambio;

    //Si todo esta correcto navega a Home
    this._router.navigate([RouteNamesService.HOME]);
  }

  //Cerrar sesion
  async cerrarSesion(): Promise<void> {
    //Abre el dialogo para confirmar el cierre de sesion 
    this._notificationsService.showCloseSesionDialog();
  }

}
