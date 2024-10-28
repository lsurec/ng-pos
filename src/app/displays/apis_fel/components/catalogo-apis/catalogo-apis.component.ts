import { Component } from '@angular/core';
import { ApiInterface } from '../../interfaces/api.interface';
import { CertificadorService } from '../../services/certificador.service';

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

  apis: ApiInterface[] = [
    {
      nombre: "Infile",
      metodo: "Zona1",
      url: "1234567-8",
    },
    {
      nombre: "Infile",
      metodo: "Zona1",
      url: "1234567-8",
    },
    {
      nombre: "Infile",
      metodo: "Zona1",
      url: "1234567-8",
    },
    {
      nombre: "Infile",
      metodo: "Zona1",
      url: "1234567-8",
    },
    {
      nombre: "Infile",
      metodo: "Zona1",
      url: "1234567-8",
    },
  ];

  backPage() {
    this.mantenimiento.catalogo = false;
    this.mantenimiento.certificador = true;
  }

  loadData() {
  }

  detalleApi() {
  }

}
