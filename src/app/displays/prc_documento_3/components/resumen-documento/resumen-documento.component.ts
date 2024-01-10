import { Component } from '@angular/core';
import { EventService } from 'src/app/services/event.service';
import { CompraInterface, ProductoInterface } from '../../interfaces/producto.interface';
import { PagoInterface } from '../../interfaces/pagos.interface';

@Component({
  selector: 'app-resumen-documento',
  templateUrl: './resumen-documento.component.html',
  styleUrls: ['./resumen-documento.component.scss']
})
export class ResumenDocumentoComponent {

  productos: ProductoInterface[] = [
    {
      sku: 'AL1',
      nombre: 'Viuda en barbacoa'
    },
    {
      sku: 'BF2',
      nombre: 'Limonana natural'
    },
  ]

  compras: CompraInterface[] = [
    {
      producto: this.productos[0],
      cantidad: 3,
      precioUnitario: 55.00,
      total: 165.00,
    },
    {
      producto: this.productos[1],
      cantidad: 4,
      precioUnitario: 20.00,
      total: 80.00,
    }
  ]

  pagos: PagoInterface[] = [
    {
      id: 1,
      nombre: "EFECTIVO",
      monto: 80,
    },
    {
      id: 1,
      nombre: "CHEQUE",
      monto: 165.00,
      autorizacion: "30393650",
      referencia: "",
      banco: "Banco Industrial"
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
