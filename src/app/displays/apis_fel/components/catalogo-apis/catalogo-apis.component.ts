import { Component } from '@angular/core';
import { CertificadorService } from '../../services/certificador.service';
import { CatalogoAPIInterface } from '../../interfaces/catalogo_api.interface';
import { catalogoApi } from '../../provider_temp/catalogo_api';

@Component({
  selector: 'app-catalogo-apis',
  templateUrl: './catalogo-apis.component.html',
  styleUrls: ['./catalogo-apis.component.scss']
})
export class CatalogoApisComponent {


  constructor(
    public mantenimiento: CertificadorService,
  ) {

  }

  apis: CatalogoAPIInterface[] = catalogoApi;

  backPage() {
    this.mantenimiento.catalogo = false;
    this.mantenimiento.certificador = true;
  }

  loadData() {
  }

  detalleApi(api: CatalogoAPIInterface) {
    this.mantenimiento.accion = 0;
    this.mantenimiento.api = api;
    this.mantenimiento.catalogo = false;
    this.mantenimiento.apiDetalle = true;
  }

  nueva() {
    this.mantenimiento.accion = 1;
    this.mantenimiento.catalogo = false;
    this.mantenimiento.apiDetalle = true;
  }

  showError() {
    this.mantenimiento.verError = true;
  }

}
