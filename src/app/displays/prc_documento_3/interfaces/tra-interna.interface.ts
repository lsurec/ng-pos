import { BodegaProductoInterface } from "./bodega-produto.interface";
import { ProductoInterface } from "./producto.interface";
import { UnitarioInterface } from "./unitario.interface";

export interface TraInternaInterface {
    isChecked: boolean;
    producto: ProductoInterface;
    bodega?: BodegaProductoInterface; // La propiedad es opcional con la opción de ser nula
    precio?: UnitarioInterface; // La propiedad es opcional con la opción de ser nula
    cantidad: number;
    precioDia: number | null;
    precioCantidad: number | null;
    total: number;
    operaciones: TraInternaInterface[];
    descuento: number;
    cargo: number;
    estadoInterno:number; //0 ninguno; 1 nuevo; 2 eliminar; 3 actualizar
    consecutivo:number;
}