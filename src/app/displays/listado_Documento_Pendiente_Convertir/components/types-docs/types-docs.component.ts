import { Component, OnInit } from '@angular/core';
import { GlobalConvertService } from '../../services/global-convert.service';

@Component({
  selector: 'app-types-docs',
  templateUrl: './types-docs.component.html',
  styleUrls: ['./types-docs.component.scss']
})
export class TypesDocsComponent implements OnInit {
  isLoading: boolean = false; //pantalla de carga
  showError: boolean = true;
  origen: boolean = false;
  tipo!: number;


  cotizaciones: string[] = [
    "Restaurante (14)",
    "Cotización a Cliente (20)"
  ]

  constructor(
    private _globalConvertSrevice: GlobalConvertService,

  ) {

  }
  ngOnInit(): void {
    console.log(this._globalConvertSrevice.screen);

  }

  verError() {
    this.showError = false;
  }

  irTipoCotizacion(index: number) {
    // guardar el tipo de cotizacion para mostar el titulo
    if (index == 0) this.tipo = 1;
    if (index == 1) this.tipo = 2;

    this.origen = true;

    console.log(this.tipo);

  }

}
