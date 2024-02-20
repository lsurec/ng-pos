import { Component, Inject, Input, OnInit } from '@angular/core';
import { GlobalConvertService } from '../../services/global-convert.service';
import { MatDatepicker } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';

@Component({
  selector: 'app-origin-docs',
  templateUrl: './origin-docs.component.html',
  styleUrls: ['./origin-docs.component.scss']
})
export class OriginDocsComponent implements OnInit {

  isLoading: boolean = false; //pantalla de carga
  showError: boolean = false;


  fechaIni: Date = new Date();
  fechaFin: Date = new Date();


  volver: number = 2; //volver a lista de tipos de documentos


  @Input() tipo?: number = 2;

  constructor(
    private _globalConvertSrevice: GlobalConvertService,
    private _adapter: DateAdapter<any>, date: DateAdapter<Date>,
    @Inject(MAT_DATE_LOCALE) private _locale: string,
  ) {
    this.setLangPicker()
  }
  ngOnInit(): void {
    console.log(this._globalConvertSrevice.screen);

  }

  //traducir idioma de DATEPIKER al idioma seleccionado
  setLangPicker(): void {
    this._locale = "es-ES";
    this._adapter.setLocale(this._locale);
  }

}
