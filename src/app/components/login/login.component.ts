//Utilidades de angular
import { Router } from '@angular/router';
import { Component } from '@angular/core';
//Servicios utilizados
import { TranslateService } from '@ngx-translate/core';
import { LoginService } from 'src/app/services/login.service';
import { EncryptService } from 'src/app/services/encrypt.service';
import { RouteNamesService } from 'src/app/services/route.names.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { LocalSettingsService } from 'src/app/services/local-settings.service';
import { TipoCambioService } from 'src/app/displays/prc_documento_3/services/tipo-cambio.service';
//Interfaces utilizadas
import { UserInterface } from 'src/app/interfaces/user.interface';
import { LoginInterface } from 'src/app/interfaces/login.interface';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { EmpresaInterface } from 'src/app/interfaces/empresa.interface';
import { EstacionInterface } from 'src/app/interfaces/estacion.interface';
import { TipoCambioInterface } from 'src/app/displays/prc_documento_3/interfaces/tipo-cambio.interface';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [
    //Inyeccion de servicios
    LoginService,
    LocalSettingsService,
    EncryptService,
    TipoCambioService,
  ]
})
export class LoginComponent {

  //Declaracion de variables a utilizar
  nombreInput: string = ""; //usuario
  claveInput: string = ""; //clave
  isLoading: boolean = false; //cargar pantalla
  saveMyData: boolean = false; //guardar infomacion
  mostrarTexto: boolean = false; //ver clave

  constructor(
    //Instancia de servicios y variables privadas
    private _router: Router,
    private _loginService: LoginService,
    private _translate: TranslateService,
    private _encryptService: EncryptService,
    private _widgetsService: NotificationsService,
    private _tipoCambioService: TipoCambioService,
    private _localSettingsService: LocalSettingsService,
  ) {
  }

  //Validar usuario y contraseña
  async login(): Promise<void> {
    //Sino hay usuario ni contrase;a mostrar notificacion de que debe completar
    if (!this.nombreInput || !this.claveInput) {
      this._widgetsService.openSnackbar(this._translate.instant('pos.alertas.completar'));
      return
    }
    //Interface de credenciales
    let formValues: UserInterface = {
      pass: this.claveInput,
      user: this.nombreInput
    };

    //antes de ejecutarse
    this.isLoading = true;
    let res: ResApiInterface = await this._loginService.postLogin(formValues); //consumo del api
    //cuandno termina de ejecutarse

    ///Si el servico se ejecuta mal mostar menaje
    if (!res.status) {
      //TODO:Pantalla de error
      this.isLoading = false;

      this._widgetsService.showErrorAlert(res);

      return;
    };

    //Si el servicio se ejucuto ben
    //Obtener la respuesta del api login
    let resLogin: LoginInterface = res.response;
    //si algo esta incorrecto mostrar mensaje

    if (!resLogin.success) {

      this.isLoading = false;
      this._widgetsService.openSnackbar(this._translate.instant('pos.alertas.incorrecto'));
      return;
    };

    //verificar si se guarda a informacion del usuario
    if (this.saveMyData) {
      PreferencesService.tokenStorage = resLogin.message;
      PreferencesService.userStorage = resLogin.user;
      // PreferencesService.userStorage = "ASISTENTEG";
      PreferencesService.conStorageStr = this._encryptService.encrypt(resLogin.con)
    }

    PreferencesService.token = resLogin.message;
    PreferencesService.user = resLogin.user;
    // PreferencesService.user = "ASISTENTEG";
    PreferencesService.conStr = this._encryptService.encrypt(resLogin.con)


    let user = PreferencesService.user;
    let token = PreferencesService.token;

    // //Consumo de servicios
    let resEmpresas: ResApiInterface = await this._localSettingsService.getEmpresas(user, token);

    //Si el servico se ejecuta mal mostar mensaje
    if (!resEmpresas.status) {
      this.isLoading = false;
      this._widgetsService.showErrorAlert(resEmpresas);

      return;
    }

    //empresas y estaciones
    let empresas: EmpresaInterface[] = [];
    let estaciones: EstacionInterface[] = [];


    //Guardar Emoresas obtenidas
    empresas = resEmpresas.response;

    //Consumo de servcicio que tiene las estaciones de trabajo
    let resEstacion: ResApiInterface = await this._localSettingsService.getEstaciones(user, token);

    //Si algo sale mal
    if (!resEstacion.status) {
      //detener pantalla de carga
      this.isLoading = false;

      this._widgetsService.showErrorAlert(resEstacion);
      return;
    }

    //si tod esta bien, guardar la respuesta del servicio 
    estaciones = resEstacion.response;

    if (estaciones.length == 0 || empresas.length == 0) {
      this._widgetsService.openSnackbar(`${this._translate.instant('pos.alerta.configuracion')} ${user}`);
      return;
    }

    if (empresas.length == 1 && estaciones.length == 1) {
      PreferencesService.empresa = empresas[0];
      PreferencesService.estacion = estaciones[0];
      PreferencesService.imgEmpresa = PreferencesService.empresa.empresa_Img;   

      //Cargar tipo cambio
      let resTipoCammbio = await this._tipoCambioService.getTipoCambio(
        user,
        token,
        PreferencesService.empresa.empresa,
      );

      this.isLoading = false;

      if (!resTipoCammbio.status) {

        this.isLoading = false;
        this._widgetsService.showErrorAlert(resTipoCammbio);
        return;
      }

      let tipoCambio: TipoCambioInterface[] = resTipoCammbio.response;

      PreferencesService.tipoCambio = tipoCambio[0].tipo_Cambio;

      this._router.navigate([RouteNamesService.HOME]);
      return;
    };

    this._router.navigate([RouteNamesService.LOCAL_CONFIG]);

  };
  //Permanencia de la sesión
  rememberMe(): void {
    this.saveMyData ? this.saveMyData = false : this.saveMyData = true;
  };

  cambiarUrl(): void {
    this._router.navigate([RouteNamesService.API]);

  }

  api(): void {
    this._router.navigate([RouteNamesService.API]);
  }

}
