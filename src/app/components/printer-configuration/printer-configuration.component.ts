import { Component, Input } from '@angular/core';
import { ImpresoraFormatoInterface } from 'src/app/interfaces/impre-form.interface';
import { EventService } from 'src/app/services/event.service';
import { PreferencesService } from 'src/app/services/preferences.service';

@Component({
  selector: 'app-printer-configuration',
  templateUrl: './printer-configuration.component.html',
  styleUrls: ['./printer-configuration.component.scss']
})
export class PrinterConfigurationComponent {

  tipos: ImpresoraFormatoInterface[] = [
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
  ]

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

  impresora?: ImpresoraFormatoInterface;
  formato?: ImpresoraFormatoInterface;
  vistaPrevia: boolean = false;
  cantidad: number = 1;

  constructor(
    private _eventService: EventService,

  ) {
  }

  //regresar a home
  goBack() {
    this._eventService.regresarHomedesdeImpresorasEvent(true);
  }

  restar() {
    this.cantidad!--;

    if (this.cantidad! <= 0) {
      this.cantidad = 1;
    }
  }

  sumar() {
    this.cantidad!++;
  }

  guardar() {
    PreferencesService.imprimir = this.impresora!.nombre;
  }

}
