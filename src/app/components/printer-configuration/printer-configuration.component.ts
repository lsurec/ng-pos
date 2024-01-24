import { Component, Input } from '@angular/core';
import { ImpresoraFormatoInterface } from 'src/app/interfaces/impre-form.interface';
import { EventService } from 'src/app/services/event.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-printer-configuration',
  templateUrl: './printer-configuration.component.html',
  styleUrls: ['./printer-configuration.component.scss']
})
export class PrinterConfigurationComponent {

  impresoras: ImpresoraFormatoInterface[] = [
    {
      id: 1,
      nombre: "Impresora térmica",
      checked: false
    },
    {
      id: 2,
      nombre: "Impresora infrarroja",
      checked: false
    },
    {
      id: 2,
      nombre: "Impresora láser",
      checked: false
    }
  ];

  formatos: ImpresoraFormatoInterface[] = [
    {
      id: 1,
      nombre: "TM-U",
      checked: false
    },
    {
      id: 1,
      nombre: "A-06",
      checked: false
    },
    {
      id: 1,
      nombre: "A-04",
      checked: false
    },
  ]

  @Input() volver?: number;
  @Input() pantalla?: number;

  impresora?: ImpresoraFormatoInterface; //impresora para imprimir
  formato?: ImpresoraFormatoInterface; //formato de impresion
  vistaPrevia: boolean = false; //ver vista previa de configuraciones de la impresion
  isLoading: boolean = false; //pantalla de carga
  copias: number = 1; //cantidad de copias a imprimir
  readonly regresar: number = 8; //id de la pantalla
  verError: boolean = false; //ocultar y mostrar pantalla de error


  constructor(
    private _eventService: EventService,
    private _location: Location,

  ) {

    //veriicar si hay impresora y marcarla
    if (!PreferencesService.imprimir) {
      console.log('no hay impresora');
    } else {
      for (let index = 0; index < this.impresoras.length; index++) {
        const element = this.impresoras[index];
        if (element.nombre.toLowerCase() == this.impresoras[index].nombre.toLowerCase()) {

          this.impresora = element;
        }
      }
    }
    //asignar un formato
    this.formato = this.formatos[0];

    if (!PreferencesService.vistaPrevia) {
      console.log('sin vista previa');
    } else {
      if (PreferencesService.vistaPrevia == '1')
        this.vistaPrevia = true;
    }
  }

  //regresar a home
  goBack() {

    switch (this.volver) {
      case 1:
        //desde home
        this._eventService.regresarHomedesdeImpresorasEvent(true);
        break;

      case 2:
        //desde resumen del documento     
        this._eventService.regresarResumenEvent(true);
        break;
      default:
        this._location.back();
        break;
    }
  }

  restar() {
    this.copias!--;

    if (this.copias! <= 0) {
      this.copias = 1;
    }
  }

  sumar() {
    this.copias!++;
  }

  guardar() {
    PreferencesService.imprimir = this.impresora!.nombre; //nombre de la impresora seleccionada
    if (!this.vistaPrevia) {
      PreferencesService.vistaPrevia = '0';
    } else {
      PreferencesService.vistaPrevia = '1';
    }
  }

  ver() {
    console.log(PreferencesService.imprimir);
    console.log(PreferencesService.vistaPrevia);
  }

}
