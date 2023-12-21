import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CredencialesInterface } from 'src/app/interfaces/credenciales.interface';
import { LanguageInterface } from 'src/app/interfaces/language.interface';
import { LoginInterface } from 'src/app/interfaces/login.interface';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { indexDefaultLang, languagesProvider } from 'src/app/providers/languages.provider';
import { completar, incorrecto, ok, salioMal } from 'src/app/providers/mensajes.provider';
import { LoginService } from 'src/app/services/login.service';
import { MensajesService } from 'src/app/services/mensajes.service';
import { StorageService } from 'src/app/services/storage.service';
import { WidgetsService } from 'src/app/services/widgets.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [
    WidgetsService,
    LoginService,
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

  constructor(
    private translate: TranslateService,
    private _loginService: LoginService,
    private _widgetsService: WidgetsService,
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
    // if (StorageService.token) {
    //   this._router.navigate(['/station']);
    // };
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
      // alert ("Por favor completa todos los campos para continuar")
      this._widgetsService.openSnackbar(MensajesService.findValueLrCode(completar, this.activeLang), MensajesService.findValueLrCode(ok, this.activeLang));
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
      this._widgetsService.openSnackbar(MensajesService.findValueLrCode(salioMal, this.activeLang), MensajesService.findValueLrCode(ok, this.activeLang));
      console.error(resLogin.response);
      console.error(resLogin.storeProcedure);
      return
    };

    //Si el servicio se ejucuto ben
    //Obtener la respuesta del api login
    let resApiLogin: LoginInterface = resLogin.response;
    //si algo esta incorrecto mostrar mensaje
    if (!resApiLogin.res) {
      this.isLoading = false;
      this._widgetsService.openSnackbar(MensajesService.findValueLrCode(incorrecto, this.activeLang), MensajesService.findValueLrCode(ok, this.activeLang));
      return;
    };

    //verificar si se guarda a informacion del usuario
    if (this.saveMyData) {
      //sesion permanente
      StorageService.token = resApiLogin.message;
      //guardar el usuario
      StorageService.user = this.nombreInput;
      // StorageService.user = 'desa026';
    }
    else {
      //sesion no permanente
      sessionStorage.setItem("token", resApiLogin.message);
      sessionStorage.setItem('user', this.nombreInput);
      // sessionStorage.setItem('user', 'desa026');
    };

    this.isLoading = false;
    console.log("correcto");
    
  };

  //Permanencia de la sesión
  rememberMe(): void {
    this.saveMyData ? this.saveMyData = false : this.saveMyData = true;
  };
}
