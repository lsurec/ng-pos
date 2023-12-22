import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CredencialesInterface } from 'src/app/interfaces/credenciales.interface';
import { EmpresaInterface } from 'src/app/interfaces/empresa.interface';
import { EstacionInterface } from 'src/app/interfaces/estacion.interface';
import { LanguageInterface } from 'src/app/interfaces/language.interface';
import { LoginInterface } from 'src/app/interfaces/login.interface';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { indexDefaultLang, languagesProvider } from 'src/app/providers/languages.provider';
import { completar, incorrecto, ok, salioMal } from 'src/app/providers/mensajes.provider';
import { ConfiguracionLocalService } from 'src/app/services/configuracion-local.service';
import { LoginService } from 'src/app/services/login.service';
import { MensajesService } from 'src/app/services/mensajes.service';
import { RouteNamesService } from 'src/app/services/route.names.service';
import { SharedService } from 'src/app/services/shared.service';
import { StorageService } from 'src/app/services/storage.service';
import { WidgetsService } from 'src/app/services/widgets.service';

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
  logos: boolean = true; //ocultar o mostrar logos
  isLoading: boolean = false; //cargar pantalla
  saveMyData: boolean = false; //guardar infomacion
  mostrarTexto: boolean = false; //ver clave

  //Opciones lenguajes
  languages: LanguageInterface[] = languagesProvider;
  activeLang!: LanguageInterface;

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

  ) {
    //obtener el idioma guardado en el servicio
    let getLanguage = StorageService.laguageActive;
    if (!getLanguage) {
      //sino se encuentra asignar el idioma por defecto
      this.activeLang = languagesProvider[indexDefaultLang];
      this.translate.setDefaultLang(this.activeLang.lang);
    } else {
      //si se encuentra asignar el idioma seleccionado
      let getIndexLang: number = +getLanguage;
      this.activeLang = languagesProvider[getIndexLang];
      this.translate.setDefaultLang(this.activeLang.lang);
    };
  }

  //guardar Token y navegar a la pantalla Home
  ngOnInit(): void {
    if (StorageService.token) {
      this._router.navigate([RouteNamesService.HOME]);
    };
  };

  //Obtener nombre del idioma
  getNameByLanguageRegion(data: LanguageInterface): string | undefined {
    const { names } = data;
    const languageRegion = names.find((item) => item.lrCode === `${this.activeLang.lang}-${this.activeLang.reg}`);
    return languageRegion ? languageRegion.name : undefined;
  };

  //Asigna un nuevo lenguje
  changeLang(lang: number): void {
    this.activeLang = languagesProvider[lang];
    this.translate.use(this.activeLang.lang);
    StorageService.laguageActive = JSON.stringify(lang);
  };

  //Validar usuario y contraseña
  async login(): Promise<void> {

    if (!this.nombreInput || !this.claveInput) {
      this._widgetsService.openSnackbar(this.translate.instant('pos.alertas.completar'), this.translate.instant('pos.alertas.ok'));
      return
    }
    //Interface de credenciales
    let credenciales: CredencialesInterface = {
      pass: this.claveInput,
      user: this.nombreInput
    };

    //antes de ejecutarse
    this.isLoading = true;
    this.logos = false;
    let resLogin: ResApiInterface = await this._loginService.postLogin(credenciales); //consumo del api
    //cuandno termina de ejecutarse

    this.logos = true;
    ///Si el servico se ejecuta mal mostar menaje
    if (!resLogin.status) {
      this.isLoading = false;
      this._widgetsService.openSnackbar(this.translate.instant('pos.alertas.salioMal'), this.translate.instant('pos.alertas.ok'));
      console.error(resLogin.response);
      console.error(resLogin.storeProcedure);
      return
    };

    //Si el servicio se ejucuto ben
    //Obtener la respuesta del api login
    let resApiLogin: LoginInterface = resLogin.response;
    //si algo esta incorrecto mostrar mensaje
    console.log(resApiLogin);

    if (!resApiLogin.res) {
      this.isLoading = false;
      this._widgetsService.openSnackbar(this.translate.instant('pos.alertas.incorrecto'), this.translate.instant('pos.alertas.ok'));
      return;
    };

    //verificar si se guarda a informacion del usuario
    if (this.saveMyData) {
      //sesion permanente
      StorageService.token = resApiLogin.message;
      //guardar el usuario
      // StorageService.user = this.nombreInput;
      StorageService.user = 'desa026';
    }
    else {
      //sesion no permanente
      sessionStorage.setItem("token", resApiLogin.message);
      // sessionStorage.setItem('user', this.nombreInput);
      sessionStorage.setItem('user', 'desa026');
    };

    //consumir estaciones y empresas

    //Consumo de servicios
    let resEmpresas: ResApiInterface = await this._empresa.getEmpresas();
    //Si el servico se ejecuta mal mostar mensaje
    if (!resEmpresas.status) {
      this.isLoading = false;
      this._widgetsService.openSnackbar(this.translate.instant('pos.alertas.salioMal'), this.translate.instant('pos.alertas.ok'));
      console.error(resEmpresas.response);
      console.error(resEmpresas.storeProcedure);

      this._router.navigate([[RouteNamesService.NOT_FOUND]]); //si algo sale mal mostar pantalla de no encontrado.
      return
    }
    //Guardar Emoresas obtenidas
    this.empresas = resEmpresas.response;

    //Consumo de api
    let resEstacion: ResApiInterface = await this._estacion.getEstaciones();
    this.isLoading = false;

    //Si el servico se ejecuta mal mostar mensaje
    if (!resEstacion.status) {
      this._widgetsService.openSnackbar(this.translate.instant('pos.alertas.salioMal'), this.translate.instant('pos.alertas.ok'));
      console.error(resEstacion.response);
      console.error(resEstacion.storeProcedure);
      this._router.navigate([RouteNamesService.NOT_FOUND]);
      return
    };

    //Guardar Estaciones obtenidas
    this.estaciones = resEstacion.response;
    // this.estaciones.push(this.estaciones[0]);

    if (this.empresas.length > 1 || this.estaciones.length > 1) {
      this._shared.empresas = this.empresas;
      this._shared.estaciones = this.estaciones;
      this._router.navigate([RouteNamesService.LOCAL_CONFIG]);
      return;
    };

    // Guardar la etaciones
    StorageService.empresa = JSON.stringify(this.empresas[0]);
    StorageService.estacion = JSON.stringify(this.estaciones[0]);

    //Si el usuario esta correcto y se encontraron las empresas y estaciones:
    //ir a pantalla confifuracion local
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
