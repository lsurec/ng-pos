import { ProductoInterface } from "./producto.interface";

export interface DetalleTransaccionInterface{
    producto: ProductoInterface,
    canitdad:number,
    total:number,
}