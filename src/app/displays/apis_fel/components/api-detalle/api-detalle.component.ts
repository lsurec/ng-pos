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

  api?: CatalogoAPIInterface;

  parametroN: string = "";
  valorN: string = "";
  descripcionN: string = "";

  metodo?: TipoMetodoInterface;
  servicio?: TipoServicioInterface;
  respuesta?: TipoRespuestaInterface;
  url?: string;
  nodoFirmaDoc?: string;

  constructor(
    public mantenimiento: CertificadorService,
  ) {

  }

  ngOnInit(): void {
    this.api = this.mantenimiento.api;
    this.url = this.api ? this.api.Url_Api : '';
    this.nodoFirmaDoc = this.api ? this.api.Nodo_FirmaDocumentoResponse : '';
    this.metodo = this.api ? this.mantenimiento.getTipoMetodo(this.api!.Tipo_Metodo)! : undefined;
    this.respuesta = this.api ? this.mantenimiento.getTipoRespuesta(this.api!.Tipo_Respuesta)! : undefined;
    this.servicio = this.api ? this.mantenimiento.getTipoServicio(this.api!.Tipo_Servicio)! : undefined;
  }

  backPage() {
    this.mantenimiento.api = undefined;
    this.mantenimiento.apiDetalle = false;
    this.mantenimiento.certificador = false;
    this.mantenimiento.catalogo = true;
  }

  loadData() {
  }

  aceptar() {

  }

  autoResize(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto'; // Resetea la altura para calcular la nueva altura
    const newHeight = Math.min(textarea.scrollHeight, 150); // Calcula la nueva altura, con un máximo de 150px (10 rows aprox.)
    textarea.style.height = newHeight + 'px';
  }

}
