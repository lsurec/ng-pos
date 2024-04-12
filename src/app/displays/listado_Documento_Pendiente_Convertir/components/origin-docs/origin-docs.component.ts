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

@Component({
  selector: 'app-origin-docs',
  templateUrl: './origin-docs.component.html',
  styleUrls: ['./origin-docs.component.scss']
})
export class OriginDocsComponent implements OnInit {

  user: string = PreferencesService.user;
  token: string = PreferencesService.token;
  empresa: number = PreferencesService.empresa.empresa;
  estacion: number = PreferencesService.estacion.estacion_Trabajo;
  strFilter: string = "";

  ascendente: boolean = true;
  filtroCliente: number = 1;

  filtroSelect: any;

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
    public globalConvertSrevice: GlobalConvertService,
    private _adapter: DateAdapter<any>, date: DateAdapter<Date>,
    @Inject(MAT_DATE_LOCALE) private _locale: string,
    private _eventService: EventService,
    private _receptionService: ReceptionService,
    private _notificationsService: NotificationsService,
    private _translate: TranslateService

  ) {
    this.setLangPicker();
    this.filtroSelect = this.filtros[0];
  }

  ngOnInit(): void {
    console.log("iniciando");

    this.ordenar();
  }

  onOptionChange(optionId: number) {
    this.filtroCliente = optionId;
  }

  filterDoc() {
    let timer: any;
    // TODO: reemplazar por filtro real
    // let opcionFiltro: number = this.filtroCliente;
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

  async loadData() {


    this.globalConvertSrevice.docsOrigin = [];

    this.globalConvertSrevice.isLoading = true;

    let res: ResApiInterface = await this._receptionService.getPendindgDocs(
      this.user,
      this.token,
      this.globalConvertSrevice.docSelect!.tipo_Documento,
      this.globalConvertSrevice.formatStrFilterDate(this.globalConvertSrevice.fechaInicial!),
      this.globalConvertSrevice.formatStrFilterDate(this.globalConvertSrevice.fechaFinal!),
    );

    this.globalConvertSrevice.isLoading = false;


    if (!res.status) {


      this.showError(res);

      return;

    }



    this.globalConvertSrevice.docsOrigin = res.response;
    this.globalConvertSrevice.docsOriginFilter = res.response;

    this.ordenar();


  }

  //TODO:Seeleccionar idioma de la aplicacion
  //traducir idioma de DATEPIKER al idioma seleccionado
  setLangPicker(): void {
    this._locale = "es-ES";
    this._adapter.setLocale(this._locale);
  }


  ordenar() {

    this.ascendente = !this.ascendente;

    switch (this.filtroSelect.id) {
      case 1:
        //id documento
        if (this.ascendente) {
          this.globalConvertSrevice.docsOriginFilter =
            this.globalConvertSrevice.docsOriginFilter.slice().sort((a, b) => a.iD_Documento - b.iD_Documento);
        } else {
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

  backPage() {
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




  sincronizarFechas() {

    // Convertir las fechas NgbDateStruct a objetos Date
    let date1: Date = new Date(this.globalConvertSrevice.fechaInicial!.year, this.globalConvertSrevice.fechaInicial!.month - 1, this.globalConvertSrevice.fechaInicial!.day);
    let date2: Date = new Date(this.globalConvertSrevice.fechaFinal!.year, this.globalConvertSrevice.fechaFinal!.month - 1, this.globalConvertSrevice.fechaFinal!.day);

    // Comparar las fechas Date
    if (date1 > date2) {
      this.globalConvertSrevice.fechaFinal = this.globalConvertSrevice.fechaInicial;
    }


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


  async selectOrigin(origin: OriginDocInterface) {

    this.globalConvertSrevice.docOriginSelect = origin;

    await this.loadDestinationDocs(origin);


    if (this.globalConvertSrevice.docsDestination.length == 1) {

      this.globalConvertSrevice.docDestinationSelect = this.globalConvertSrevice.docsDestination[0];



      await this.loadDetailsOrigin();

      this.globalConvertSrevice.docDestino = 0;
      this.globalConvertSrevice.mostrarDocConversion();
      return;
    }

    this.globalConvertSrevice.docDestino = 1;

    this.globalConvertSrevice.mostrarDocDestino();
  }

  async loadDetailsOrigin() {

    this.globalConvertSrevice.isLoading = true;

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

    this.globalConvertSrevice.isLoading = false;



    if (!res.status) {


      this.showError(res);

      return;

    }

    let deatlles: DetailOriginDocInterface[] = res.response;


    this.globalConvertSrevice.detailsOrigin = [];

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



  async loadDestinationDocs(doc: OriginDocInterface) {

    this.globalConvertSrevice.isLoading = true;

    let res: ResApiInterface = await this._receptionService.getDestinationDocs(
      this.user,
      this.token,
      doc.tipo_Documento,
      doc.serie_Documento,
      doc.empresa,
      doc.estacion_Trabajo,
    );

    this.globalConvertSrevice.isLoading = false;

    if (!res.status) {


      this.showError(res);

      return;

    }

    this.globalConvertSrevice.docsDestination = res.response;

  }



  async showError(res: ResApiInterface) {

    let verificador = await this._notificationsService.openDialogActions(
      {
        title: this._translate.instant('pos.alertas.salioMal'),
        description: this._translate.instant('pos.alertas.error'),
        verdadero: this._translate.instant('pos.botones.informe'),
        falso: this._translate.instant('pos.botones.aceptar'),
      }
    );

    if (!verificador) return;

    let dateNow: Date = new Date(); //fecha del error

    //Crear error
    let error: ErrorInterface = {
      date: dateNow,
      description: res.response,
      storeProcedure: res.storeProcedure,
      url: res.url,
    }

    PreferencesService.error = error;

    this.globalConvertSrevice.mostrarError(10);

  }


}
