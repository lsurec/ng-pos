import { Injectable } from "@angular/core";
import { SerieInterface } from "../../prc_documento_3/interfaces/serie.interface";
import { NotificationsService } from "src/app/services/notifications.service";
import { TranslateService } from "@ngx-translate/core";
import { LocationInterface } from "../interfaces/location.interface";
import { TableInterface } from "../interfaces/table.interface";
import { WaiterInterface } from "../interfaces/waiter.interface";
import { ClassificationRestaurantInterface } from "../interfaces/classification-restaurant.interface";
import { ProductRestaurantInterface } from "../interfaces/product-restaurant";
import { OrderInterface } from "../interfaces/order.interface";
import { TraRestaurantInterface } from "../interfaces/tra.restaurant.interface";

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
    viewMoveCheckTable: boolean = false;


    classifications: ClassificationRestaurantInterface[] = [];
    classification?: ClassificationRestaurantInterface;


    orders: OrderInterface[] = [];


    product?: ProductRestaurantInterface;

    idPantalla: number = 0;

    viewTranCheck: boolean = false;
    viewCheck: boolean = true;
    nameCheck: string = "";

    selectAllChecks: boolean = false; //Seleccionar todas las cuentas
    selectTranAllChecks: boolean = false; //Seleccionar todas las transacciones de una cuenta

    verDetalleOrden: boolean = false;
    viewChecksMove: boolean = true;
    viewTranCheckMove: boolean = false;
    indexMoveCheck: number = 0;

    //1: Cuenta
    //2: Transaccion
    tipoTraslado: number = 0;

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


    updateOrdersTable(): void {
        for (let i = 0; i < this.tables.length; i++) {
            const mesa = this.tables[i];
            this.tables[i].orders = [];

            for (let j = 0; j < this.orders.length; j++) {
                const order = this.orders[j];

                if (order.mesa.elemento_Id === mesa.elemento_Id) {
                    this.tables[i].orders.push(j);
                }
            }
        }
    }

    addTransactionFirst(
        transaction: TraRestaurantInterface,
        indexOrder: number,
    ) {
        this.orders[indexOrder].transacciones.push(transaction);
        this.updateOrdersTable();
    }


    addFirst(
        item: OrderInterface,
    ) {
        this.orders.push(item);
        this.updateOrdersTable();
    }


    addTransactionToOrder(
        transaction: TraRestaurantInterface,
        idexOrder: number,
    ) {


        this.orders[idexOrder].transacciones.push(transaction);


        this.updateOrdersTable();
    }


    getTotal(idexOrder: number) {
        let total: number = 0;


        this.orders[idexOrder].transacciones.forEach(element => {

            total += (element.cantidad * element.precio.precioU);
        });

        return total;
    }
}