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
      nombre: "LOGIN",
      metodo: "POST",
      url: "/api/Login",
    },
    {
      nombre: "EMPRESAS",
      metodo: "GET",
      url: "/api/Empresa/{usuario}",
    },
    {
      nombre: "ESTACIONES DE TRABAJO",
      metodo: "GET",
      url: "/api/Estacion/{usuario}",
    },
    {
      nombre: "APLICACIONES",
      metodo: "GET",
      url: "/api/Application/{usuario}",
    },
    {
      nombre: "DISPLAYS",
      metodo: "GET",
      url: "/api/Display",
    },
  ];

  backPage() {
    this.mantenimiento.catalogo = false;
    this.mantenimiento.certificador = true;
  }

  loadData() {
  }

  detalleApi(api: ApiInterface) {
    this.mantenimiento.api = api;
    this.mantenimiento.catalogo = false;
    this.mantenimiento.apiDetalle = true;
  }

}
