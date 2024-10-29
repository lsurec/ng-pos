import { Component, OnInit } from '@angular/core';
import { CertificadorService } from '../../services/certificador.service';
import { TipoMetodoInterface } from '../../interfaces/tipo_metodo.interface';
import { catalogoTipoMetodo } from '../../provider_temp/tipo_metodo';
import { TipoDatoInterface } from '../../interfaces/tipo_dato.interface';
import { catalogoTipoDato } from '../../provider_temp/tipo_dato';
import { catalogoTipoRespuesta } from '../../provider_temp/tipo_respuesta';
import { TipoRespuestaInterface } from '../../interfaces/tipo_respuesta.interface';
import { catalogoTipoServicio } from '../../provider_temp/tipo_servicio';
import { TipoServicioInterface } from '../../interfaces/tipo_servicio.interface';
import { ApiInterface } from '../../interfaces/api.interface';

@Component({
  selector: 'app-api-detalle',
  templateUrl: './api-detalle.component.html',
  styleUrls: ['./api-detalle.component.scss']
})
export class ApiDetalleComponent implements OnInit {

  catalogoTipoMetodo: TipoMetodoInterface[] = catalogoTipoMetodo;
  catalogoTipoDato: TipoDatoInterface[] = catalogoTipoDato;
  catalogoTipoRespuesta: TipoRespuestaInterface[] = catalogoTipoRespuesta;
  catalogoTipoServicio: TipoServicioInterface[] = catalogoTipoServicio;

  api?: ApiInterface;

  constructor(
    public mantenimiento: CertificadorService,
  ) {

  }
  ngOnInit(): void {
    this.api = this.mantenimiento.api;
  }

  backPage() {
    this.mantenimiento.apiDetalle = false;
    this.mantenimiento.certificador = false;
    this.mantenimiento.catalogo = true;
  }

  loadData() {
  }

  aceptar() {

  }


}
