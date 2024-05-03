import { DetailOriginDocInterInterface } from "./detail-origin-doc.interface";

export interface ValidateProductInterface{
    sku:string,
    productoDesc:string,
    bodega:string,
    tipoDoc:string,
    serie:string,
    mensajes:string[],
}