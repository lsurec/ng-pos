import { Injectable } from "@angular/core";
import { SerieInterface } from "../../prc_documento_3/interfaces/serie.interface";
import { NotificationsService } from "src/app/services/notifications.service";
import { TranslateService } from "@ngx-translate/core";
import { LocationInterface } from "../interfaces/location.interface";
import { TableInterface } from "../interfaces/table.interface";

@Injectable({
    providedIn: 'root',
})


//Servicio para commpartir datos del modulo factura
export class GlobalRestaurantService {

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
    tabPago: boolean = false; //Contorlador para la pestaña de pago

    viewLocations: boolean = true;
    viewRestaurant: boolean = false;

    

    viewTables: boolean = false;
    pinMesero: number = 0;

   
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

    async viewPinMesero() {
        this._notificationService.pinMesero();
    }
}