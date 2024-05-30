import { Component, Inject, OnInit } from '@angular/core';
import { GlobalConvertService } from '../../services/global-convert.service';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { EventService } from 'src/app/services/event.service';
import { components } from 'src/app/providers/componentes.provider';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { PreferencesService } from 'src/app/services/preferences.service';
import { ReceptionService } from '../../services/reception.service';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { ErrorInterface } from 'src/app/interfaces/error.interface';
import { OriginDocInterface } from '../../interfaces/origin-doc.interface';
import { DetailOriginDocInterface } from '../../interfaces/detail-origin-doc.interface';
import { TranslateService } from '@ngx-translate/core';
import { NotificationsService } from 'src/app/services/notifications.service';
import { FiltroInterface } from 'src/app/displays/prc_documento_3/interfaces/filtro.interface';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-origin-docs',
  templateUrl: './origin-docs.component.html',
  styleUrls: ['./origin-docs.component.scss'],
  providers:[CurrencyPipe]
})
export class OriginDocsComponent implements OnInit {

  user: string = PreferencesService.user; //usuario de la sesion
  token: string = PreferencesService.token; //token del usuario de la sesion
  empresa: number = PreferencesService.empresa.empresa; // emporesa de la sesuin
  estacion: number = PreferencesService.estacion.estacion_Trabajo;//etsacion e la sesion

  strFilter: string = ""; //texto para filtrar dicuemntos por nombre o nit

  ascendente: boolean = true; //orden de la lista

  filtroCliente: number = 1; //Filtro de busqueda por defecto nombre

  filtroSelect: any;  //Filtro seleccionado

  //filtros disponibles
  filtros: any[] = [
    {
      "id": 1,
      "desc": this._translate.instant('pos.documento.idDoc'),
    },
    {
      "id": 2,
      "desc": this._translate.instant('pos.documento.fechaDoc')
    },
  ]

  //filtros dispinibles
  filtrosBusqueda: FiltroInterface[] = [
    {
      id: 1,
      nombre: this._translate.instant('pos.factura.nombre'),
    },
    {
      id: 2,
      nombre: "NIT",
    },
  ];


  constructor(
    //instancias de los servicios que se van a utilizar
    public globalConvertSrevice: GlobalConvertService,
    private _adapter: DateAdapter<any>, date: DateAdapter<Date>,
    @Inject(MAT_DATE_LOCALE) private _locale: string,
    private _eventService: EventService,
    private _receptionService: ReceptionService,
    private _notificationsService: NotificationsService,
    private _translate: TranslateService

  ) {
    //asiganr lenguaje a picker date
    this.setLangPicker();

    //seleccionar filtro por defecto
    this.filtroSelect = this.filtros[0];
  }

  ngOnInit(): void {
    //ordenar los datos de la lista visible segun configuracion de los filtros
    this.ordenar();
  }

  filterDoc() {
    let timer: any;
    //evaluar filtro de busqueda 
    switch (this.filtroCliente) {
      case 1: //Nombre
        // Configurar un nuevo temporizador
        clearTimeout(timer); // Limpiar el temporizador anterior

        timer = setTimeout(() => {
          this.globalConvertSrevice.docsOriginFilter =
            this.globalConvertSrevice.docsOrigin.filter(
              item => item.cliente.toLowerCase().includes(this.strFilter.toLowerCase())
            );
          this.ordenar();
        }, 500); // 500 milisegundos (0.5 segundos) de retraso

        break;
      case 2: //Nit
        clearTimeout(timer); // Limpiar el temporizador anterior

        timer = setTimeout(() => {
          this.globalConvertSrevice.docsOriginFilter =
            this.globalConvertSrevice.docsOrigin.filter(
              item => item.nit.toLowerCase().includes(this.strFilter.toLowerCase())
            );
          this.ordenar();
        }, 500); // 500 milisegundos (0.5 segundos) de retraso

        break;

      default:
        break;
    }

  }

  //cargar datos inciiales
  async loadData() {

    //limpiar datos previos
    this.globalConvertSrevice.docsOrigin = [];

    //inciiar proceso
    this.globalConvertSrevice.isLoading = true;

    //Uso del servicio para obtner documentos pendientes de recepcionar
    let res: ResApiInterface = await this._receptionService.getPendindgDocs(
      this.user,
      this.token,
      this.globalConvertSrevice.docSelect!.tipo_Documento,
      this.globalConvertSrevice.formatStrFilterDate(this.globalConvertSrevice.fechaInicial!),
      this.globalConvertSrevice.formatStrFilterDate(this.globalConvertSrevice.fechaFinal!),
    );

    //finalizar proiceso
    this.globalConvertSrevice.isLoading = false;


    //si elservico falló mostrar error
    if (!res.status) {
      this.showError(res);
      return;
    }

    //Respuest del servicio
    this.globalConvertSrevice.docsOrigin = res.response;
    this.globalConvertSrevice.docsOriginFilter = res.response;

    //ordenar datos segun configuracines
    this.ordenar();
  }

  //TODO:Seeleccionar idioma de la aplicacion
  //traducir idioma de DATEPIKER al idioma seleccionado
  setLangPicker(): void {
    this._locale = "es-ES";
    this._adapter.setLocale(this._locale);
  }

  //ooirdenar datos de l lista segun la configuracion
  ordenar() {

    //Cambair orden de la  lista
    this.ascendente = !this.ascendente;

    //Evaluar orden deseado
    switch (this.filtroSelect.id) {
      case 1:
        //id documento
        if (this.ascendente) { //orden ascendente
          this.globalConvertSrevice.docsOriginFilter =
            this.globalConvertSrevice.docsOriginFilter.slice().sort((a, b) => a.iD_Documento - b.iD_Documento);
        } else {  //orden descendente
          this.globalConvertSrevice.docsOriginFilter =
            this.globalConvertSrevice.docsOriginFilter.slice().sort((a, b) => b.iD_Documento - a.iD_Documento);
        }

        break;
      case 2:
        if (this.ascendente) {
          // Ordenar por fecha de forma ascendente
          this.globalConvertSrevice.docsOriginFilter =
            this.globalConvertSrevice.docsOriginFilter =
            this.globalConvertSrevice.docsOriginFilter.slice().sort((a, b) => new Date(b.fecha_Hora).getTime() - new Date(a.fecha_Hora).getTime());
        }

        break;

      default:
        break;
    }
  }

  //salir de l avista
  backPage() {
    //evaluar desde donde se mostrio la pantalla poara regresar a ala correcta 
    if (!this.globalConvertSrevice.screen) {
      this.globalConvertSrevice.mostrarTiposDoc();
      return;
    }


    this.goBack();

  }

  //regresear a menu (pantalla de inicio)
  goBack(): void {
    components.forEach(element => {
      element.visible = false;
    });

    this._eventService.emitCustomEvent(false);
  }


  //cambaiar fechas en la vista  
  sincronizarFechas() {

    // Convertir las fechas NgbDateStruct a objetos Date
    let date1: Date = new Date(this.globalConvertSrevice.fechaInicial!.year, this.globalConvertSrevice.fechaInicial!.month - 1, this.globalConvertSrevice.fechaInicial!.day);
    let date2: Date = new Date(this.globalConvertSrevice.fechaFinal!.year, this.globalConvertSrevice.fechaFinal!.month - 1, this.globalConvertSrevice.fechaFinal!.day);

    // Comparar las fechas Date
    if (date1 > date2) {
      this.globalConvertSrevice.fechaFinal = this.globalConvertSrevice.fechaInicial;
    }

    //bsicar nuevos docuemtos segun la fecha cambiada
    this.loadData();
  }

  //convertir una fecha ngbDateStruct a fecha Date.
  convertirADate(ngbDate: NgbDateStruct): Date {
    if (ngbDate) {
      let { year, month, day } = ngbDate;
      return new Date(year, month - 1, day); // Restar 1 al mes,
    };
    return new Date();
  };

  //seleccioanr documento origen
  async selectOrigin(origin: OriginDocInterface) {

    //asiganr documento otigen deleccionado 
    this.globalConvertSrevice.docOriginSelect = origin;

    //bsuacr docuemntos destino al que se pouede convertir el documento origen
    await this.loadDestinationDocs(origin);


    //Si solo hay un odcumento destino selecciionarlo  por default
    if (this.globalConvertSrevice.docsDestination.length == 1) {

      //seleccioanr unico docucemnto destino
      this.globalConvertSrevice.docDestinationSelect = this.globalConvertSrevice.docsDestination[0];

      //Cragara detalles de documento origern
      await this.loadDetailsOrigin();

      //ir aa siuuiente pantalla
      this.globalConvertSrevice.docDestino = 0;
      this.globalConvertSrevice.mostrarDocConversion();
      return;
    }

    //si ahy varios dicuemntos ir a la oantala de docuemntos destino 
    this.globalConvertSrevice.docDestino = 1;

    this.globalConvertSrevice.mostrarDocDestino();
  }

  //caraghra detalles del docuemnto origen
  async loadDetailsOrigin() {

    //inciar el procespp
    this.globalConvertSrevice.isLoading = true;

    //Consumo del servisio
    let res: ResApiInterface = await this._receptionService.getDetallesDocOrigen(
      this.token,
      this.user,
      this.globalConvertSrevice.docOriginSelect!.documento,
      this.globalConvertSrevice.docOriginSelect!.tipo_Documento,
      this.globalConvertSrevice.docOriginSelect!.serie_Documento,
      this.globalConvertSrevice.docOriginSelect!.empresa,
      this.globalConvertSrevice.docOriginSelect!.localizacion,
      this.globalConvertSrevice.docOriginSelect!.estacion_Trabajo,
      this.globalConvertSrevice.docOriginSelect!.fecha_Reg,

    )

    ///Finaliar el procespo
    this.globalConvertSrevice.isLoading = false;

    //Si el servicio falló mostrar error
    if (!res.status) {
      this.showError(res);
      return;
    }

    //respuesta del sservivixo
    let deatlles: DetailOriginDocInterface[] = res.response;

    //limpiar datos prwvios
    this.globalConvertSrevice.detailsOrigin = [];

    //Nuevo objeto con cehk para seleccionar transacciones
    deatlles.forEach(element => {
      this.globalConvertSrevice.detailsOrigin.push(
        {
          checked: false,
          detalle: element,
          disponibleMod: element.disponible,
        }
      );
    });
  }

  //caraar docuemntos destino
  async loadDestinationDocs(doc: OriginDocInterface) {

    //inciar el proceso 
    this.globalConvertSrevice.isLoading = true;

    //Consumo del servico 
    let res: ResApiInterface = await this._receptionService.getDestinationDocs(
      this.user,
      this.token,
      doc.tipo_Documento,
      doc.serie_Documento,
      doc.empresa,
      doc.estacion_Trabajo,
    );

      //finalizar  carga
    this.globalConvertSrevice.isLoading = false;

    //si el servicio falló mostrar error
    if (!res.status) {
      this.showError(res);
      return;
    }

    //respuesta del servivios
    this.globalConvertSrevice.docsDestination = res.response;

  }

  //mostrar error
  async showError(res: ResApiInterface) {

    //dialogo de confirmacion
    let verificador = await this._notificationsService.openDialogActions(
      {
        title: this._translate.instant('pos.alertas.salioMal'),
        description: this._translate.instant('pos.alertas.error'),
        verdadero: this._translate.instant('pos.botones.informe'),
        falso: this._translate.instant('pos.botones.aceptar'),
      }
    );

    //Cancelar
    if (!verificador) return;

    let dateNow: Date = new Date(); //fecha del error

    //Crear error
    let error: ErrorInterface = {
      date: dateNow,
      description: res.response,
      storeProcedure: res.storeProcedure,
      url: res.url,
    }

    //guardar eror
    PreferencesService.error = error;

    //msotrar antallad de error
    this.globalConvertSrevice.mostrarError(10);
  }
}