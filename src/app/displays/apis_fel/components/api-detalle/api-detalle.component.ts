import { Component } from '@angular/core';
import { CertificadorService } from '../../services/certificador.service';

@Component({
  selector: 'app-api-detalle',
  templateUrl: './api-detalle.component.html',
  styleUrls: ['./api-detalle.component.scss']
})
export class ApiDetalleComponent {


  constructor(
    public mantenimiento: CertificadorService,
  ) {

  }

  backPage() {
    this.mantenimiento.apiDetalle = false;
    this.mantenimiento.certificador = false;
    this.mantenimiento.catalogo = true;
  }

  loadData() {
  }


}
