import { Documento } from "./doc-estructura.interface"
import { GetDocInterface } from "./get-doc.interface"

export interface DocumentoResumenInterface {
    item:GetDocInterface,
    estructura:Documento,
    subtotal: number,
    cargo: number,
    descuento: number,
    total: number
}
