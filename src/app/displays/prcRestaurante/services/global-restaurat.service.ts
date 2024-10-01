import { Injectable } from "@angular/core";
import { SerieInterface } from "../../prc_documento_3/interfaces/serie.interface";

@Injectable({
    providedIn: 'root',
})


//Servicio para commpartir datos del modulo factura
export class RestaurantService {
    isLoading: boolean = false; //Pantalla de carga
    verError: boolean = false; //ocultar y mostrar pantalla de error
    tipoDocumento?: number; //Tipo de documento
    documentoName: string = ""; //Descripcion tipo de documento
    series: SerieInterface[] = [] //Series disponibles para un odcumento
    serie?: SerieInterface; //Serie seleccionada
    tabDocummento: boolean = true; //contorlador para la pestaña documento
    tabDetalle: boolean = false;  //controlador para la pestaña de detalle
    tabPago: boolean = false; //Contorlador para la pestaña de pago

    showDetalle() { }
    showPago() { }
}