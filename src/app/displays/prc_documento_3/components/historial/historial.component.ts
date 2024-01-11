import { Component } from '@angular/core';
import { EventService } from 'src/app/services/event.service';
import { DocumentoResumenInterface } from '../../interfaces/documento-resumen.interface';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.scss']
})
export class HistorialComponent {

  isLoading: boolean = false;

  documentos: DocumentoResumenInterface[] =
    [
      {
        id: 10209,
        fecha_hora: "05/10/2023 07:19",
        saldo: 50.00,
        cargo: 10.00,
        descuento: 5.00,
        total: 55.00
      },
      {
        id: 10210,
        fecha_hora: "06/10/2023 15:00",
        saldo: 60.00,
        cargo: 10.00,
        descuento: 0.00,
        total: 70.00
      },
      {
        id: 10211,
        fecha_hora: "07/10/2023 08:10",
        saldo: 60.00,
        cargo: 10.00,
        descuento: 0.00,
        total: 70.00
      }
    ]

  constructor(
    private _eventService: EventService,
  ) {
  }

  goBack() {
    this._eventService.verDocumentoEvent(true);
  }
}
