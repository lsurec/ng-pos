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
  descendente: boolean = false;


  fechaInicial: NgbDateStruct; //fecha inicial 
  fechaFinal: NgbDateStruct;

  filtro!: string;

  filtros: string[] = [
    "Id documento",
    "Fecha"
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
    this.filtro = this.filtros[0];

    let today: Date = new Date();

    this.fechaInicial = { year: today.getFullYear(), month: today.getMonth() + 1, day: 1 };
    this.fechaFinal = this._calendar.getToday();
  }

  ngOnInit(): void {


  }

  addLeadingZero(number: number): string {
    return number.toString().padStart(2, '0');
  }

  formatStrFilterDate(date: NgbDateStruct) {
    return `${date.year}${this.addLeadingZero(date.month)}${this.addLeadingZero(date.day)}`;
  }




  async loadData() {


    this.globalConvertSrevice.docsOrigin = [];

    this.globalConvertSrevice.isLoading = true;

    let res: ResApiInterface = await this.receptionService.getPendindgDocs(
      this.user,
      this.token,
      this.globalConvertSrevice.docSelect!.tipo_Documento,
      this.formatStrFilterDate(this.fechaInicial),
      this.formatStrFilterDate(this.fechaFinal),
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

  //traducir idioma de DATEPIKER al idioma seleccionado
  setLangPicker(): void {
    this._locale = "es-ES";
    this._adapter.setLocale(this._locale);
  }


  ordenar() {

    if (this.ascendente) {
      console.log("de manera asendente");
    }

    if (this.descendente) {
      console.log("de manera descendente");
    }

    this.ascendente = !this.ascendente;
    this.descendente = !this.descendente;
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
    // Verifica si la fecha inicial está definida
    if (this.fechaInicial) {
      // Convierte la fecha inicial a un formato de string
      let fechaInicialString = this.ngbDateParserFormatter.format(this.fechaInicial);

      // Convierte la fecha inicial string de nuevo a NgbDateStruct
      let fechaInicialStruct: NgbDateStruct = this.ngbDateParserFormatter.parse(fechaInicialString)!;

      // Actualiza la fecha final
      this.fechaFinal = fechaInicialStruct;
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
