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


  @Input() tipo?: number = 2;

  ascendente: boolean = true;

  filtro: string = "Id documento";

  filtros: string[] = [
    "Id documento",
    "Fecha documento"
  ]


  constructor(
    public globalConvertSrevice: GlobalConvertService,
    private _adapter: DateAdapter<any>, date: DateAdapter<Date>,
    @Inject(MAT_DATE_LOCALE) private _locale: string,
    private _eventService: EventService,
    private _calendar: NgbCalendar,
    private ngbDateParserFormatter: NgbDateParserFormatter,
    private receptionService: ReceptionService,

  ) {
    this.setLangPicker();
  }

  ngOnInit(): void { }

  async loadData() {


    this.globalConvertSrevice.docsOrigin = [];

    this.globalConvertSrevice.isLoading = true;

    let res: ResApiInterface = await this.receptionService.getPendindgDocs(
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

      this.globalConvertSrevice.mostrarError(9);

      return;

    }

    this.globalConvertSrevice.docsOrigin = res.response;


  }

  //TODO:Seeleccionar idioma de la aplicacion
  //traducir idioma de DATEPIKER al idioma seleccionado
  setLangPicker(): void {
    this._locale = "es-ES";
    this._adapter.setLocale(this._locale);
  }


  ordenar() {


    switch (this.filtro) {
      case "Id documento":

        break;
      case "Fecha documento":
        break;

      default:
        break;
    }
  }

  backPage() {
    if (!this.globalConvertSrevice.screen) {
      this.backScreen();
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


  backScreen() {
    this.globalConvertSrevice.showError = false;
    this.globalConvertSrevice.verTiposDocConversion = true;
    this.globalConvertSrevice.verDocOrigen = false;
    this.globalConvertSrevice.verDocDestino = false;
    this.globalConvertSrevice.verDocConversion = false;
    this.globalConvertSrevice.verDetalleDocConversion = false;

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


  convertirDocumeto(docDestino: number) {
    if (docDestino == 0) this.globalConvertSrevice.mostrarDocConversion();

    if (docDestino == 1) this.globalConvertSrevice.mostrarDocDestino()
  }

}
