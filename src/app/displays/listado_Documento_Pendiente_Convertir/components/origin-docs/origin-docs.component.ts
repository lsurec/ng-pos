import { Component, Inject, Input, OnInit } from '@angular/core';
import { GlobalConvertService } from '../../services/global-convert.service';
import { MatDatepicker } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { EventService } from 'src/app/services/event.service';
import { components } from 'src/app/providers/componentes.provider';
import { NgbCalendar, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-origin-docs',
  templateUrl: './origin-docs.component.html',
  styleUrls: ['./origin-docs.component.scss']
})
export class OriginDocsComponent implements OnInit {

  @Input() tipo?: number = 2;
  isLoading: boolean = false; //pantalla de carga
  showError: boolean = false;
  fechaIni: Date = new Date();
  fechaFin: Date = new Date();

  ascendente: boolean = true;
  descendente: boolean = false;

  today: Date = new Date();

  fechaInicial?: NgbDateStruct; //fecha inicial 
  fechaFinal?: NgbDateStruct;

  filtro!: string;

  filtros: string[] = [
    "Id documento",
    "Fecha"
  ]

  documentosOrigen: any[] = [
    {
      id: 10,
      fechaHora: "14/02/2024 10:41:41",
      fechaDoc: "14/02/2024",
      usuario: "SOPORTE01",
      serie: "COT (1)",
    },
    {
      id: 14,
      fechaHora: "15/02/2024 10:41:41",
      fechaDoc: "15/02/2024",
      usuario: "SA",
      serie: "COT (1)",
    },
    {
      id: 16,
      fechaHora: "17/02/2024 10:41:41",
      fechaDoc: "14/02/2024",
      usuario: "SOPORTE01",
      serie: "COT (1)",
    },
    {
      id: 22,
      fechaHora: "21/02/2024 10:41:41",
      fechaDoc: "15/02/2024",
      usuario: "SA",
      serie: "COT (1)",
    }
  ]

  diasSemana = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];

  constructor(
    public globalConvertSrevice: GlobalConvertService,
    private _adapter: DateAdapter<any>, date: DateAdapter<Date>,
    @Inject(MAT_DATE_LOCALE) private _locale: string,
    private _eventService: EventService,
    private _calendar: NgbCalendar,
    private ngbDateParserFormatter: NgbDateParserFormatter

  ) {
    this.setLangPicker();
    this.filtro = this.filtros[0];
  }
  ngOnInit(): void {
    console.log(this.globalConvertSrevice.screen);

    this.fechaInicial = { year: this.today.getFullYear(), month: this.today.getMonth() + 1, day: 1 };
    this.fechaFinal = this._calendar.getToday();

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
