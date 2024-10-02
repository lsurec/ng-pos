import { Injectable } from "@angular/core";
import { SerieInterface } from "../../prc_documento_3/interfaces/serie.interface";
import { LocationInterface, TableInterface } from "../interfaces/location.interface";
import { NotificationsService } from "src/app/services/notifications.service";
import { TranslateService } from "@ngx-translate/core";

@Injectable({
    providedIn: 'root',
})


//Servicio para commpartir datos del modulo factura
export class GlobalRestaurantService {
    isLoading: boolean = false; //Pantalla de carga
    verError: boolean = false; //ocultar y mostrar pantalla de error
    tipoDocumento?: number; //Tipo de documento
    documentoName: string = ""; //Descripcion tipo de documento
    series: SerieInterface[] = [] //Series disponibles para un odcumento
    serie?: SerieInterface; //Serie seleccionada
    tabMenu: boolean = true; //contorlador para la pestaña documento
    tabDetalle: boolean = false;  //controlador para la pestaña de detalle
    tabPago: boolean = false; //Contorlador para la pestaña de pago

    viewLocations: boolean = true;
    viewRestaurant: boolean = false;

    locationSelect?: LocationInterface;
    tableSelect?: TableInterface;

    viewTables: boolean = false;
    pinMesero: string = "";

    locations: LocationInterface[] = [
        {
            id: 1,
            nombre: "SALON PRINCIPAL",
            disponibles: 2,
        },
        {
            id: 2,
            nombre: "SALON LAS FLORES",
            disponibles: 2,
        },
        {
            id: 3,
            nombre: "TERRAZA",
            disponibles: 6,
        },
    ]

    tables: TableInterface[] = [
        {
            id: 1,
            espacios: 2,
        },
        {
            id: 2,
            espacios: 4,
        },
        {
            id: 3,
            espacios: 6,
        },
        {
            id: 4,
            espacios: 8,
        },
    ]

    constructor(
        private _notificationService: NotificationsService,
        private _translate: TranslateService,
    ) {

    }

    showDetalle() {
        this.tabDetalle = true;
        this.tabMenu = false;
        this.tabPago = false;
    }

    showPago() {
        this.tabPago = true;
        this.tabDetalle = false;
        this.tabMenu = false;
    }

    showMenu() {
        this.tabDetalle = false;
        this.tabMenu = true;
        this.tabPago = false;

    }
}