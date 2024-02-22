import { Component, Inject, Input, OnInit } from '@angular/core';
import { GlobalConvertService } from '../../services/global-convert.service';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { EventService } from 'src/app/services/event.service';
import { components } from 'src/app/providers/componentes.provider';
import { NgbCalendar, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { PreferencesService } from 'src/app/services/preferences.service';
import { ReceptionService } from '../../services/reception.service';
import { ResApiInterface } from 'src/app/interfaces/res-api.interface';
import { ErrorInterface } from 'src/app/interfaces/error.interface';
import { OriginDocInterface } from '../../interfaces/origin-doc.interface';

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

  ascendente: boolean = true;

  filtroSelect: any;

  filtros: any[] = [
    { "id": 1, "desc": "Id documento", },
    { "id": 2, "desc": "Fecha documento" },
  ]


  constructor(
    public globalConvertSrevice: GlobalConvertService,
    private _adapter: DateAdapter<any>, date: DateAdapter<Date>,
    @Inject(MAT_DATE_LOCALE) private _locale: string,
    private _eventService: EventService,
    private _receptionService: ReceptionService,

  ) {
    this.setLangPicker();
    this.filtroSelect = this.filtros[0];
  }

  ngOnInit(): void {
    this.ordenar();

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

      return;

    }

    this.globalConvertSrevice.docsOrigin = res.response;

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
          this.globalConvertSrevice.docsOrigin =
            this.globalConvertSrevice.docsOrigin.slice().sort((a, b) => a.iD_Documento - b.iD_Documento);
        } else {
          this.globalConvertSrevice.docsOrigin =
            this.globalConvertSrevice.docsOrigin.slice().sort((a, b) => b.iD_Documento - a.iD_Documento);
        }

        break;
      case 2:
        if (this.ascendente) {
          // Ordenar por fecha de forma ascendente
          this.globalConvertSrevice.docsOrigin =
            this.globalConvertSrevice.docsOrigin.slice().sort((a, b) => new Date(a.fecha_Hora).getTime() - new Date(b.fecha_Hora).getTime());

        } else {

          // Ordenar por fecha de forma descendente
          this.globalConvertSrevice.docsOrigin =
            this.globalConvertSrevice.docsOrigin.slice().sort((a, b) => new Date(b.fecha_Hora).getTime() - new Date(a.fecha_Hora).getTime());
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
      this.globalConvertSrevice.docDestino = 0;
      this.globalConvertSrevice.mostrarDetalleDocConversion();
      return;
    }

    this.globalConvertSrevice.docDestino = 1;

    this.globalConvertSrevice.mostrarDocDestino();
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

      return;

    }

    this.globalConvertSrevice.docsDestination = res.response;
    this.globalConvertSrevice.docsDestination.push(this.globalConvertSrevice.docsDestination[0]);





  }

}
