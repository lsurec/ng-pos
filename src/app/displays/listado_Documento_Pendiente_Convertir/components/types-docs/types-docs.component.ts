import { Component, OnInit } from '@angular/core';
import { GlobalConvertService } from '../../services/global-convert.service';
import { components } from 'src/app/providers/componentes.provider';
import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-types-docs',
  templateUrl: './types-docs.component.html',
  styleUrls: ['./types-docs.component.scss']
})
export class TypesDocsComponent implements OnInit {

  tipo!: number;


  cotizaciones: string[] = [
    "Restaurante (14)",
    "Cotización a Cliente (20)",
    "Restaurante (14)",
    "Cotización a Cliente (20)",
    "Restaurante (14)",
    "Cotización a Cliente (20)",
    "Restaurante (14)",
    "Cotización a Cliente (20)",
    "Restaurante (14)",
    "Cotización a Cliente (20)",
    "Restaurante (14)",
    "Cotización a Cliente (20)",
    "Restaurante (14)",
    "Cotización a Cliente (20)",

  ]

  constructor(
    public globalConvertSrevice: GlobalConvertService,
    private _eventService: EventService,

  ) {

  }
  ngOnInit(): void {
    console.log(this.globalConvertSrevice.screen);
    console.log("tipos");


  }

  //regresear a menu (pantalla de inicio)
  goBack(): void {
    components.forEach(element => {
      element.visible = false;
    });

    this._eventService.emitCustomEvent(false);
  }

  verError() {
  }

  irTipoCotizacion(index: number) {

    this.globalConvertSrevice.showError = false;
    this.globalConvertSrevice.verTiposDocConversion = false;
    this.globalConvertSrevice.verDocOrigen = true;
    this.globalConvertSrevice.verDocDestino = false;
    this.globalConvertSrevice.verDocConversion = false;
    this.globalConvertSrevice.verDetalleDocConversion = false;

    this.globalConvertSrevice.screen = "";

    return;
    // guardar el tipo de cotizacion para mostar el titulo
    if (index == 0) this.tipo = 1;
    if (index == 1) this.tipo = 2;

    console.log(this.tipo);

  }

}
