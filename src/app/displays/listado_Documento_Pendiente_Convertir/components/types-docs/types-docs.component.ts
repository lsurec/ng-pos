import { Component, OnInit } from '@angular/core';
import { GlobalConvertService } from '../../services/global-convert.service';

@Component({
  selector: 'app-types-docs',
  templateUrl: './types-docs.component.html',
  styleUrls: ['./types-docs.component.scss']
})
export class TypesDocsComponent implements OnInit {

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
    console.log("tipos");


  }

  verError() {
  }

  irTipoCotizacion(index: number) {

      this._globalConvertSrevice.showError = false;
      this._globalConvertSrevice.verTiposDocConversion = false;
      this._globalConvertSrevice.verDocOrigen = true;
      this._globalConvertSrevice.verDocDestino = false;
      this._globalConvertSrevice.verDocConversion = false;
      this._globalConvertSrevice.verDetalleDocConversion = false;

    return;
    // guardar el tipo de cotizacion para mostar el titulo
    if (index == 0) this.tipo = 1;
    if (index == 1) this.tipo = 2;

    console.log(this.tipo);

  }

}
