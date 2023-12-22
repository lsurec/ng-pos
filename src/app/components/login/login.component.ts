import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { UserInterface } from 'src/app/interfaces/user.interface';
import { EmpresaInterface } from 'src/app/interfaces/empresa.interface';
import { EstacionInterface } from 'src/app/interfaces/estacion.interface';
import { LanguageInterface } from 'src/app/interfaces/language.interface';
import { LoginInterface } from 'src/app/interfaces/login.interface';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { completar, incorrecto, ok, salioMal } from 'src/app/providers/mensajes.provider';
import { ConfiguracionLocalService } from 'src/app/services/configuracion-local.service';
import { LoginService } from 'src/app/services/login.service';
import { MensajesService } from 'src/app/services/mensajes.service';
import { SharedService } from 'src/app/services/shared.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { WidgetsService } from 'src/app/services/widgets.service';
import { DataUserService } from 'src/app/services/data-user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [
    WidgetsService,
    LoginService,
    ConfiguracionLocalService,
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
    private _empresa: ConfiguracionLocalService,
    private _estacion: ConfiguracionLocalService,
    private _router: Router,
    private _shared: SharedService,
    private _dataUserService: DataUserService,

  ) {
   
  }


  //Validar usuario y contraseña
  async login(): Promise<void> {

    if (!this.nombreInput || !this.claveInput) {
      // alert ("Por favor completa todos los campos para continuar")
      this._widgetsService.openSnackbar(this.translate.instant('crm.login.completar'), "ok");
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
      this._widgetsService.openSnackbar("MensajesService.findValueLrCode(salioMal, this.activeLang)", "ok");
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
      this._widgetsService.openSnackbar("MensajesService.findValueLrCode(incorrecto, this.activeLang)", "ok");
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

    console.log(resLogin);


    //consumir estaciones y empresas

    // //Consumo de servicios
    // let resEmpresas: ResApiInterface = await this._empresa.getEmpresas();
    // //Si el servico se ejecuta mal mostar mensaje
    // if (!resEmpresas.status) {
    //   this.isLoading = false;
    //   this._widgetsService.openSnackbar(MensajesService.findValueLrCode(salioMal, this.activeLang), MensajesService.findValueLrCode(ok, this.activeLang));
    //   console.error(resEmpresas.response);
    //   console.error(resEmpresas.storeProcedure);

    //   this._router.navigate(['/notFound']); //si algo sale mal mostar pantalla de no encontrado.
    //   return
    // }
    // //Guardar Emoresas obtenidas
    // this.empresas = resEmpresas.response;

    // //Consumo de api
    // let resEstacion: ResApiInterface = await this._estacion.getEstaciones();
    // this.isLoading = false;

    // //Si el servico se ejecuta mal mostar mensaje
    // if (!resEstacion.status) {
    //   this._widgetsService.openSnackbar(MensajesService.findValueLrCode(salioMal, this.activeLang), MensajesService.findValueLrCode(ok, this.activeLang));
    //   console.error(resEstacion.response);
    //   console.error(resEstacion.storeProcedure);
    //   this._router.navigate(['/notFound']);
    //   return
    // };

    // //Guardar Estaciones obtenidas
    // this.estaciones = resEstacion.response;
    // // this.estaciones.push(this.estaciones[0]);

    // if (this.empresas.length > 1 || this.estaciones.length > 1) {
    //   this._shared.empresas = this.empresas;
    //   this._shared.estaciones = this.estaciones;
    //   this._router.navigate(['/station']);
    //   return;
    // };

    // // Guardar la etaciones
    // StorageService.empresa = JSON.stringify(this.empresas[0]);
    // StorageService.estacion = JSON.stringify(this.estaciones[0]);

    // //Si el usuario esta correcto y se encontraron las empresas y estaciones:
    // //ir a pantalla confifuracion local
    // this._router.navigate(['/station']);
  };
  //Permanencia de la sesión
  rememberMe(): void {
    this.saveMyData ? this.saveMyData = false : this.saveMyData = true;
  };
}
