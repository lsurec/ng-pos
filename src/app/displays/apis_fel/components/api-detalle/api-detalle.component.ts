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
import { CatalogoAPIInterface } from '../../interfaces/catalogo_api.interface';
import { CatalogoParametroInterface } from '../../interfaces/catalogo_parametro.interface';
import { catalogoParametro } from '../../provider_temp/catalogo_parametro';
import { TipoParametroInterface } from '../../interfaces/tipo_parammetro.interface';
import { catalogoTipoParametro } from '../../provider_temp/tipo_parametro';

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
  catalogoParametro: CatalogoParametroInterface[] = catalogoParametro;
  catalogoTipoParametro: TipoParametroInterface[] = catalogoTipoParametro;

  api?: CatalogoAPIInterface;

  parametroN: string = "";
  valorN: string = "";
  descripcionN: string = "";

  metodo?: TipoMetodoInterface;
  servicio?: TipoServicioInterface;
  respuesta?: TipoRespuestaInterface;

  constructor(
    public mantenimiento: CertificadorService,
  ) {

  }
  ngOnInit(): void {
    this.api = this.mantenimiento.api;

    this.metodo = this.getTipoMetodo(this.api!.Tipo_Metodo)!;
    this.respuesta = this.getTipoRespuesta(this.api!.Tipo_Respuesta)!;
    this.servicio = this.getTipoServicio(this.api!.Tipo_Servicio)!;
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

  getTipoMetodo(tipo: number): TipoMetodoInterface | null {
    for (let index = 0; index < this.catalogoTipoMetodo.length; index++) {
      let element: TipoMetodoInterface = this.catalogoTipoMetodo[index];

      if (tipo === element.Tipo_Metodo) {
        return element;
      }
    }
    // Agregar retorno explícito en caso de que no haya coincidencia
    return null;
  }

  getTipoParametro(tipo: number): TipoParametroInterface | null {
    for (let index = 0; index < this.catalogoTipoParametro.length; index++) {
      let element: TipoParametroInterface = this.catalogoTipoParametro[index];

      if (tipo === element.Tipo_Parametro) {
        return element;
      }
    }
    // Agregar retorno explícito en caso de que no haya coincidencia
    return null;
  }

  getTipoDato(tipo: number): TipoDatoInterface | null {
    for (let index = 0; index < this.catalogoTipoDato.length; index++) {
      let element: TipoDatoInterface = this.catalogoTipoDato[index];

      if (tipo === element.Tipo_Dato) {
        return element;
      }
    }
    // Agregar retorno explícito en caso de que no haya coincidencia
    return null;
  }

  getTipoRespuesta(tipo: number): TipoRespuestaInterface | null {
    for (let index = 0; index < this.catalogoTipoRespuesta.length; index++) {
      let element: TipoRespuestaInterface = this.catalogoTipoRespuesta[index];

      if (tipo === element.Tipo_Respuesta) {
        return element;
      }
    }
    // Agregar retorno explícito en caso de que no haya coincidencia
    return null;
  }

  getTipoServicio(tipo: number): TipoServicioInterface | null {
    for (let index = 0; index < this.catalogoTipoServicio.length; index++) {
      let element: TipoServicioInterface = this.catalogoTipoServicio[index];

      if (tipo === element.Tipo_Servicio) {
        return element;
      }
    }
    // Agregar retorno explícito en caso de que no haya coincidencia
    return null;
  }

}
