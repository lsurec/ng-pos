import { Component, Inject, Input, OnInit } from '@angular/core';
import { GlobalConvertService } from '../../services/global-convert.service';
import { MatDatepicker } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { EventService } from 'src/app/services/event.service';
import { components } from 'src/app/providers/componentes.provider';

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

  ) {
    this.setLangPicker();
    this.filtro = this.filtros[0];
  }
  ngOnInit(): void {
    console.log(this.globalConvertSrevice.screen);

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


}
