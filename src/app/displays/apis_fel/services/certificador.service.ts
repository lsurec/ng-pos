import { Injectable } from "@angular/core";
import { CatalogoAPIInterface } from "../interfaces/catalogo_api.interface";
import { CatalogoParametroInterface } from "../interfaces/catalogo_parametro.interface";
import { TipoDatoInterface } from "../interfaces/tipo_dato.interface";
import { TipoMetodoInterface } from "../interfaces/tipo_metodo.interface";
import { TipoParametroInterface } from "../interfaces/tipo_parammetro.interface";
import { TipoRespuestaInterface } from "../interfaces/tipo_respuesta.interface";
import { TipoServicioInterface } from "../interfaces/tipo_servicio.interface";
import { catalogoParametro } from "../provider_temp/catalogo_parametro";
import { catalogoTipoDato } from "../provider_temp/tipo_dato";
import { catalogoTipoMetodo } from "../provider_temp/tipo_metodo";
import { catalogoTipoParametro } from "../provider_temp/tipo_parametro";
import { catalogoTipoRespuesta } from "../provider_temp/tipo_respuesta";
import { catalogoTipoServicio } from "../provider_temp/tipo_servicio";

@Injectable({
    providedIn: 'root',
})

export class CertificadorService {

    isLoading: boolean = false;
    catalogo: boolean = false;
    certificador: boolean = true;
    apiDetalle: boolean = false;
    api?: CatalogoAPIInterface;

    //Listas

    catalogoTipoMetodo: TipoMetodoInterface[] = catalogoTipoMetodo;
    catalogoTipoDato: TipoDatoInterface[] = catalogoTipoDato;
    catalogoTipoRespuesta: TipoRespuestaInterface[] = catalogoTipoRespuesta;
    catalogoTipoServicio: TipoServicioInterface[] = catalogoTipoServicio;
    catalogoParametro: CatalogoParametroInterface[] = catalogoParametro;
    catalogoTipoParametro: TipoParametroInterface[] = catalogoTipoParametro;

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

    autoResize(event: Event): void {
        const textarea = event.target as HTMLTextAreaElement;
        textarea.style.height = 'auto'; // Resetea la altura para calcular la nueva altura
        const newHeight = Math.min(textarea.scrollHeight, 150); // Calcula la nueva altura, con un máximo de 150px (10 rows aprox.)
        textarea.style.height = newHeight + 'px';
    }
}