import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { EmpresaInterface } from 'src/app/interfaces/empresa.interface';
import { EstacionInterface } from 'src/app/interfaces/estacion.interface';
import { LoginInterface } from 'src/app/interfaces/login.interface';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { UserInterface } from 'src/app/interfaces/user.interface';
import { DataUserService } from 'src/app/services/data-user.service';
import { LocalSettingsService } from 'src/app/services/local-settings.service';
import { LoginService } from 'src/app/services/login.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { RouteNamesService } from 'src/app/services/route.names.service';
import { WidgetsService } from 'src/app/services/widgets.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [
    LoginService,
    LocalSettingsService,
  ]
})
export class LoginComponent {

  //Declaracion de variables a utilizar
  nombreInput: string = ""; //usuario
  claveInput: string = ""; //clave
  isLoading: boolean = false; //cargar pantalla
  saveMyData: boolean = false; //guardar infomacion
  mostrarTexto: boolean = false; //ver clave


  //empresas y estaciones
  empresas: EmpresaInterface[] = [];
  estaciones: EstacionInterface[] = [];

  constructor(
    private translate: TranslateService,
    private _loginService: LoginService,
    private _widgetsService: WidgetsService,
    private _localSettingsService: LocalSettingsService,
    private _router: Router,
    private _dataUserService: DataUserService,

  ) {
   
  }


  //Validar usuario y contraseña
  async login(): Promise<void> {

    if (!this.nombreInput || !this.claveInput) {
      this._widgetsService.openSnackbar(this.translate.instant('pos.alertas.completar'), this.translate.instant('pos.alertas.ok'));
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
      this._widgetsService.openSnackbar(this.translate.instant('pos.alertas.salioMal'), this.translate.instant('pos.alertas.ok'));
      console.error(res.response);
      console.error(res.storeProcedure);
      return
    };

    //Si el servicio se ejucuto ben
    //Obtener la respuesta del api login
    let resLogin: LoginInterface = res.response;
    //si algo esta incorrecto mostrar mensaje

    if (!resLogin.success) {
      this.isLoading = false;
      this._widgetsService.openSnackbar(this.translate.instant('pos.alertas.incorrecto'), this.translate.instant('pos.alertas.ok'));
      return;
    };

    //verificar si se guarda a informacion del usuario
    if (this.saveMyData) {
      //sesion permanente
      PreferencesService.token = resLogin.message;
      //guardar el usuario
      PreferencesService.user = resLogin.user;
      this._dataUserService.token = resLogin.message;
      this._dataUserService.user = resLogin.user;
    }
    else {
      //sesion no permanente
      this._dataUserService.token = resLogin.message;
      this._dataUserService.user = resLogin.user;
    };


    let user = this._dataUserService.user;
    let token = this._dataUserService.token;

    // //Consumo de servicios
    let resEmpresas: ResApiInterface = await this._localSettingsService.getEmpresas(user, token);
    //Si el servico se ejecuta mal mostar mensaje
    if (!resEmpresas.status) {
      //TODO: Error view
      this.isLoading = false;
      this._widgetsService.openSnackbar(this.translate.instant('pos.alertas.salioMal'), this.translate.instant('pos.alertas.ok'));
      console.error(resEmpresas.response);
      console.error(resEmpresas.storeProcedure);

      return;
    }

    
    //Guardar Emoresas obtenidas
    this.empresas = resEmpresas.response;

    let resEstacion: ResApiInterface = await this._localSettingsService.getEstaciones(user, token);

    this.isLoading = false;

    if (!resEstacion.status) {
      //TODO: Error view
      this.isLoading = false;
      this._widgetsService.openSnackbar(this.translate.instant('pos.alertas.salioMal'), this.translate.instant('pos.alertas.ok'));
      console.error(resEstacion.response);
      console.error(resEstacion.storeProcedure);

      return;
    }

    this.estaciones = resEstacion.response;

    if(this.estaciones.length == 0 || this.empresas.length == 0){
      this._widgetsService.openSnackbar(`No se encontraron empresas o estaciones de trabajo para el usuario: ${user}`, "Ok");
      return;
    }

      this._dataUserService.empresas = this.empresas;
      this._dataUserService.estaciones = this.estaciones;

      this._dataUserService.estaciones.push(this.estaciones[0]);


    if (this.empresas.length == 1 && this.estaciones.length == 1) {
      this._dataUserService.selectedEmpresa = this.empresas[0];
      this._dataUserService.selectedEstacion = this.estaciones[0];

      this._router.navigate([RouteNamesService.HOME]);
      return;
    };

    this._router.navigate([RouteNamesService.LOCAL_CONFIG]);

   
    
  };
  //Permanencia de la sesión
  rememberMe(): void {
    this.saveMyData ? this.saveMyData = false : this.saveMyData = true;
  };

  cambiarUrl() {
    this._router.navigate([RouteNamesService.API]);

  }

}
