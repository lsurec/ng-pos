import { Documento } from "./doc-estructura.interface"
import { GetDocInterface } from "./get-doc.interface"

export interface DocumentoResumenInterface {
    ref_id:number,
    item:GetDocInterface,
    estructura:Documento,
    subtotal: number,
    cargo: number,
    descuento: number,
    total: number
}

export interface DocumentoHistorialInterface {
    idDocRef : String,
    ConsecutivoInterno: number
    fecha: Date,
    subtotal: number,
    cargo: number,
    descuento: number,
    total: number,
}