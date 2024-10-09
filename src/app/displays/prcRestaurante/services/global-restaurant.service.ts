import { Injectable } from "@angular/core";
import { SerieInterface } from "../../prc_documento_3/interfaces/serie.interface";
import { NotificationsService } from "src/app/services/notifications.service";
import { TranslateService } from "@ngx-translate/core";
import { LocationInterface } from "../interfaces/location.interface";
import { TableInterface } from "../interfaces/table.interface";
import { WaiterInterface } from "../interfaces/waiter.interface";
import { elementos } from "../interfaces/send-order.interface";
import { ClassificationRestaurantInterface } from "../interfaces/classification-restaurant.interface";
import { ProductRestaurantInterface } from "../interfaces/product-restaurant";
import { BodegaProductoInterface } from "../../prc_documento_3/interfaces/bodega-produto.interface";
import { UnitarioInterface } from "../../prc_documento_3/interfaces/unitario.interface";
import { GarnishTreeInterface } from "../interfaces/garnish.interface";

@Injectable({
    providedIn: 'root',
})


//Servicio para commpartir datos del modulo factura
export class GlobalRestaurantService {


    waiter?: WaiterInterface;
    locations: LocationInterface[] = [];
    location?: LocationInterface;
    tables: TableInterface[] = [];
    table?: TableInterface;

    //----------
    isLoading: boolean = false; //Pantalla de carga
    verError: boolean = false; //ocultar y mostrar pantalla de error
    tipoDocumento?: number; //Tipo de documento
    documentoName: string = ""; //Descripcion tipo de documento
    series: SerieInterface[] = [] //Series disponibles para un odcumento
    serie?: SerieInterface; //Serie seleccionada
    tabMenu: boolean = true; //contorlador para la pestaña documento
    tabDetalle: boolean = false;  //controlador para la pestaña de detalle

    tabAccesos: boolean = true;
    tabMesasAbiertas: boolean = false;

    viewLocations: boolean = true;
    viewRestaurant: boolean = false;

    pinMesero: string = "";

    classifications: ClassificationRestaurantInterface[] = [];
    classification?: ClassificationRestaurantInterface;

    bodegas: BodegaProductoInterface[] = [];
    bodega?: BodegaProductoInterface;

    unitarios: UnitarioInterface[] = [];
    unitario?: UnitarioInterface;

    garnishs: GarnishTreeInterface[] = [];

    product?: ProductRestaurantInterface;
    total: number = 0; //total de la transaccion (cantidad * precio)

    idPantalla: number = 0;
    observacion: string = "";

    constructor(
        private _notificationService: NotificationsService,
        private _translate: TranslateService,
    ) {

    }

    showDetalle() {
        this.tabDetalle = true;
        this.tabMenu = false;
    }

    showMenu() {
        this.tabDetalle = false;
        this.tabMenu = true;
    }

    showRestaurant() {
        this.tabAccesos = true;
        this.tabMesasAbiertas = false;
    }

    mesasAbiertas() {
        this.tabAccesos = false;
        this.tabMesasAbiertas = true;
    }
}