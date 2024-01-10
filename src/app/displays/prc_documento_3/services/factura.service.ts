
import { Injectable } from '@angular/core';
import { SerieInterface } from '../interfaces/serie.interface';
import { VendedorInterface } from '../interfaces/vendedor.interface';
import { TipoTransaccionInterface } from '../interfaces/tipo-transaccion.interface';
import { ParametroInterface } from '../interfaces/parametro.interface';
import { FormaPagoInterface } from '../interfaces/forma-pago.interface';

@Injectable({
    providedIn: 'root',
})
export class FacturaService {
    isLoading: boolean = false;
    tipoDocumento?: number;
    documentoName: string = "";
    series:SerieInterface[] = []
    serie?:SerieInterface;
    vendedores:VendedorInterface[] = [];
    vendedor?:VendedorInterface;
    tiposTransaccion:TipoTransaccionInterface[] = [];
    parametros:ParametroInterface[] = [];
    formasPago:FormaPagoInterface[]=[];

    constructor() { }



}
