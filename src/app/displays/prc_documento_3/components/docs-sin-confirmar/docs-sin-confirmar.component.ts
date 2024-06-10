import { Component } from '@angular/core';
import { DocumentoHistorialInterface, DocumentoResumenInterface } from '../../interfaces/documento-resumen.interface';
import { EventService } from 'src/app/services/event.service';
import { FacturaService } from '../../services/factura.service';

@Component({
  selector: 'app-docs-sin-confirmar',
  templateUrl: './docs-sin-confirmar.component.html',
  styleUrls: ['./docs-sin-confirmar.component.scss']
})
export class DocsSinConfirmarComponent {

  isLoading: boolean = false; //Pantalla de carga
  readonly regresar: number = 16; //id de la pantlla
  verError: boolean = false; // Ver pamtalla informe de errores
  historial: boolean = true;   //ver hisytorial
  detalleDocumento: boolean = false; //ver detalle de un docuento
  docSelect!: DocumentoHistorialInterface; //documento seleccionado
  estructura!: DocumentoResumenInterface;


  documentos: DocumentoHistorialInterface[] = [
    {
      idDocRef: "DOC001",
      ConsecutivoInterno: 1,
      fecha: new Date('2023-01-15'),
      subtotal: 100.00,
      cargo: 10.00,
      descuento: 5.00,
      total: 105.00
    },
    {
      idDocRef: "DOC002",
      ConsecutivoInterno: 2,
      fecha: new Date('2023-02-20'),
      subtotal: 200.00,
      cargo: 15.00,
      descuento: 10.00,
      total: 205.00
    },
    {
      idDocRef: "DOC003",
      ConsecutivoInterno: 3,
      fecha: new Date('2023-03-25'),
      subtotal: 150.00,
      cargo: 12.00,
      descuento: 7.00,
      total: 155.00
    },
    {
      idDocRef: "DOC004",
      ConsecutivoInterno: 4,
      fecha: new Date('2023-04-30'),
      subtotal: 250.00,
      cargo: 20.00,
      descuento: 15.00,
      total: 255.00
    }
  ];

  constructor(
    private _eventService: EventService,
    public facturaService: FacturaService,
  ) {

    //Evento para mostla lista de documentos
    this._eventService.verHistorialSinConfirmar$.subscribe((eventData) => {
      this.verHistorial();
    });

    //Coulatr informe de error
    this._eventService.verHistorialSinConfirmar$.subscribe((eventData) => {
      this.verError = false;
    });

  }

  loadData() {

  }

  verDetalle() {
    this.facturaService.regresarAHistorial = 2;
    this.detalleDocumento = true;
    this.historial = false;
  }

  goBack() {
    // this._eventService.emitCustomEvent(true);
    this._eventService.regresarDesdeHistorialSinConfirmarEvent(true);
  }

  //ver la lista de documntos del hisytorial
  verHistorial() {
    this.detalleDocumento = false;
    this.historial = true;
  }

  showError() {
    this.verError = true;
    this.detalleDocumento = false;
    this.historial = false;
  }

}
