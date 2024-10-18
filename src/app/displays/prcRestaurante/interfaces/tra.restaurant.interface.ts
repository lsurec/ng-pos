import { BodegaProductoInterface } from "../../prc_documento_3/interfaces/bodega-produto.interface";
import { UnitarioInterface } from "../../prc_documento_3/interfaces/unitario.interface";
import { GarnishTraInteface } from "./garnish.interface";
import { ProductRestaurantInterface } from "./product-restaurant";

export interface TraRestaurantInterface {
    cantidad: number;
    precio: UnitarioInterface;
    bodega: BodegaProductoInterface;
    producto: ProductRestaurantInterface;
    observacion: string;
    guarniciones: GarnishTraInteface[];
    selected: boolean;
    processed: boolean;
  }
  