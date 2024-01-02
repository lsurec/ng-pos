import { Component } from '@angular/core';
import { EventService } from 'src/app/services/event.service';
import { FiltroInterface } from '../../interfaces/filtro.interface';

@Component({
  selector: 'app-factura',
  templateUrl: './factura.component.html',
  styleUrls: ['./factura.component.scss']
})
export class FacturaComponent {

  serie!: string;
  series: string[] = [
    "FAC M",
    "FAC MX",
    "FAC GT"
  ]
  vendedor!: string;
  vendedores: string[] = [
    "Proveedor",
    "Vendedor 01",
    "DEMOSOFT"
  ]
  switchState: boolean = false;

  constructor(
    private _eventService: EventService
  ) {

  }

  backPage() {
    this._eventService.emitCustomEvent(false);
  }
  // Función para manejar el cambio de estado del switch
  toggleSwitch(): void {
    this.switchState = !this.switchState;
  }

  documento: boolean = false;
  detalle: boolean = true;
  pago: boolean = false;

  vistaDocumento() {
    this.documento = true;
    this.detalle = false;
    this.pago = false;
  }

  vistaDetalle() {
    this.detalle = true;
    this.documento = false;
    this.pago = false;
  }

  vistaPago() {
    this.pago = true;
    this.detalle = false;
    this.documento = false;
  }

  searchText!: string;
  selectedOption: number | null = 1;


  filtrosBusqueda: FiltroInterface[] = [
    {
      id: 1,
      nombre: "SKU",
    },
    {
      id: 2,
      nombre: "Descripción",
    },
  ];

  buscarProducto() {

  }

  onOptionChange(optionId: number) {
    this.selectedOption = optionId;
  }
}
