import { LocationInterface } from "./location.interface";
import { TableInterface } from "./table.interface";
import { TraRestaurantInterface } from "./tra.restaurant.interface";
import { WaiterInterface } from "./waiter.interface";

export interface OrderInterface {
    consecutivo: number;
    consecutivoRef: number;
    selected: boolean;
    mesero: WaiterInterface;
    nombre: string;
    ubicacion: LocationInterface;
    mesa: TableInterface;
    transacciones: TraRestaurantInterface[];
  }
  