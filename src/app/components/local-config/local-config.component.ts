import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { EmpresaInterface } from 'src/app/interfaces/empresa.interface';
import { EstacionInterface } from 'src/app/interfaces/estacion.interface';
import { LanguageInterface } from 'src/app/interfaces/language.interface';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { indexDefaultLang, languagesProvider } from 'src/app/providers/languages.provider';
import { borraranDatos, cancelar, debeSeleccionar, noSeleccionado, ok, salioMal, tituloCerrar } from 'src/app/providers/mensajes.provider';
import { ConfiguracionLocalService } from 'src/app/services/configuracion-local.service';
import { EventService } from 'src/app/services/event.service';
import { MensajesService } from 'src/app/services/mensajes.service';
import { RouteNamesService } from 'src/app/services/route.names.service';
import { SharedService } from 'src/app/services/shared.service';
import { StorageService } from 'src/app/services/storage.service';
import { WidgetsService } from 'src/app/services/widgets.service';

@Component({
  selector: 'app-local-config',
  templateUrl: './local-config.component.html',
  styleUrls: ['./local-config.component.scss'],
  providers: [
    //inyeccion de servicios
    ConfiguracionLocalService,
    WidgetsService
  ]
})
export class LocalConfigComponent {
  //Declaracion de variables
  nonSelect: string = ''; //frase que indica que no se ha seleccionado empresa o estacion
  isLoading: boolean = false; //pantalla de carga

  //empresa seleccionada y estacion seleccionada
  empresaSelect?: EmpresaInterface;
  estacionSelect?: EstacionInterface;

  //empresas y estaciones disponibles para el usuario
  empresas: EmpresaInterface[] = [];
  estaciones: EstacionInterface[] = [];
  regresar: boolean = true;

  //Idiomas disponibles de la aplicacion
  languages: LanguageInterface[] = languagesProvider;
  activeLang: LanguageInterface;
  idioma: number = indexDefaultLang;

  constructor(
    //Instancia de servicios a utilizar
    private _router: Router,
    private _eventService: EventService,
    private translate: TranslateService,
    private _sharedService: SharedService,
    private _widgetsService: WidgetsService,
    private _empresa: ConfiguracionLocalService,
    private _estacion: ConfiguracionLocalService,

  ) {

    //Buscar y obtener el leguaje guardado en el servicio  
    let getLanguage = StorageService.laguageActive;
    if (!getLanguage) {
      this.activeLang = languagesProvider[indexDefaultLang];
      this.translate.setDefaultLang(this.activeLang.lang);
    } else {
      //sino se encuentra asignar el idioma por defecto
      this.idioma = +getLanguage;
      this.activeLang = languagesProvider[this.idioma];
      this.translate.setDefaultLang(this.activeLang.lang);
    };

    //obtener listas de empresas y estaciones guardadas en Shared Service
    this.empresas = this._sharedService.empresas;
    this.estaciones = this._sharedService.estaciones;

    //verificar si la lista tiene solo un elemento
    if (this.empresas.length == 1) {
      //Seleccionar la empresa 
      this.empresaSelect = this.empresas[0];
    };

    //verificar si la lista tiene solo un elemento
    if (this.estaciones.length == 1) {
      //Seleccionar la estacion
      this.estacionSelect = this.estaciones[0];
    };

    //si las istas estan vacias, volver a cargar el servicio
    if (this.empresas.length == 0 || this.estaciones.length == 0) {
      this.estacionesTrabajo();
    }
    //traducir frase de "No seleccionada."
    this.nonSelect = MensajesService.findValueLrCode(noSeleccionado, this.activeLang);
  };

  async estacionesTrabajo(): Promise<void> {
    //Consumo de servicios
    this.isLoading = true;
    let resEmpresas: ResApiInterface = await this._empresa.getEmpresas();
    //Si el servico se ejecuta mal mostrar mensaje
    if (!resEmpresas.status) {
      this.isLoading = false; //dejar de cargar la pantalla
      this._widgetsService.openSnackbar(this.translate.instant('pos.alertas.salioMal'), this.translate.instant('pos.alertas.ok'));
      console.error(resEmpresas.response);
      console.error(resEmpresas.storeProcedure);
      return
    }

    //Guardar empresas obtenidas
    this.empresas = resEmpresas.response;

    //Consumo de api
    let resEstacion: ResApiInterface = await this._estacion.getEstaciones();
    //Si el servico se ejecuta mal mostrar mensaje
    this.isLoading = false; //dejar de cargar 
    if (!resEstacion.status) {
      this._widgetsService.openSnackbar(this.translate.instant('pos.alertas.salioMal'), this.translate.instant('pos.alertas.ok'));
      console.error(resEstacion.response);
      console.error(resEstacion.storeProcedure);
      return
    }

    //Guardar Estaciones
    this.estaciones = resEstacion.response;
    // this.estaciones.push(this.estaciones[0]) //insertar un nuevo elemento a la lista para pruebas

    //verificar si la lista tiene solo un elemento
    if (this.empresas.length == 1) {
      //Seleccionar la empresa 
      this.empresaSelect = this.empresas[0];
    };

    //verificar si la lista tiene solo un elemento
    if (this.estaciones.length == 1) {
      //Seleccionar la estacion
      this.estacionSelect = this.estaciones[0];
    };

    //Si solo hay una empresa y solo una estacion, guardarlas en el Storage
    if (this.estaciones.length == 1 && this.empresas.length == 1) {
      StorageService.empresa = JSON.stringify(this.empresaSelect);
      StorageService.estacion = JSON.stringify(this.estacionSelect);
      this._router.navigate([RouteNamesService.HOME]); //navegar a home
    }
  };

  irAHome(): void {
    //Validar que se seleccione empresa y estacion
    if (!this.empresaSelect || !this.estacionSelect) {
      this._widgetsService.openSnackbar(this.translate.instant('pos.alertas.debeSeleccionar'), this.translate.instant('pos.alertas.ok'));
      return;
    };

    //Guardar empresa y estacion seleccionada en el Storage y navegar a Home
    StorageService.empresa = JSON.stringify(this.empresaSelect);
    StorageService.estacion = JSON.stringify(this.estacionSelect);
    this._router.navigate([RouteNamesService.HOME]);
  };

  //Cerrar sesion
  async cerrarSesion(): Promise<void> {
    let verificador = await this._widgetsService.openDialogActions(
      {
        title: MensajesService.findValueLrCode(tituloCerrar, this.activeLang),
        description: MensajesService.findValueLrCode(borraranDatos, this.activeLang),
        verdadero: MensajesService.findValueLrCode(ok, this.activeLang),
        falso: MensajesService.findValueLrCode(cancelar, this.activeLang)
      }
    );

    if (!verificador) return;

    localStorage.removeItem("token");
    localStorage.removeItem("name");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("name");

    //Regresar a Login
    this._router.navigate([RouteNamesService.LOGIN]);

    //Limpiar storage del navegador
    // localStorage.clear();
    // sessionStorage.clear();
  };

  mostrarboton() {
    //buscamos si hay alguna empresa guardada 
    let getEmpresa = StorageService.empresa;
    let getEstacion = StorageService.estacion;

    if (!getEstacion && !getEmpresa) {
      this.regresar = true;
    };

  };

  //regresar a la pantalla anterior
  backHome(): void {
    // this.newItemEvent.emit(false);
    this._eventService.emitCustomEvent(false)
  };
}
