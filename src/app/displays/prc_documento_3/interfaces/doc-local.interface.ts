import { EmpresaInterface } from "src/app/interfaces/empresa.interface";
import { EstacionInterface } from "src/app/interfaces/estacion.interface";
import { ClienteInterface } from "./cliente.interface";
import { VendedorInterface } from "./vendedor.interface";
import { SerieInterface } from "./serie.interface";
import { TraInternaInterface } from "./tra-interna.interface";
import { MontoIntreface } from "./monto.interface";
import { TipoReferenciaInterface } from "./tipo-referencia";

export interface DocLocalInterface{
    user:string,
    tipoRef?:TipoReferenciaInterface,
    refFechaEntrega?: string,
    refFechaRecoger?: string,
    refFechaInicio?: string,
    refFechaFin?: string,
    refContacto?: string,
    refDescripcion?: string,
    refDireccionEntrega?: string,
    refObservacion?: string,
    empresa:EmpresaInterface,
    estacion:EstacionInterface,
    cliente?:ClienteInterface,
    vendedor?:VendedorInterface,
    serie?:SerieInterface,
    documento:number,
    detalles:TraInternaInterface[],
    pagos:MontoIntreface[],
}