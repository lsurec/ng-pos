
import { Injectable } from '@angular/core';
import { SerieInterface } from '../interfaces/serie.interface';
import { VendedorInterface } from '../interfaces/vendedor.interface';
import { TipoTransaccionInterface } from '../interfaces/tipo-transaccion.interface';
import { ParametroInterface } from '../interfaces/parametro.interface';
import { FormaPagoInterface } from '../interfaces/forma-pago.interface';
import { ClienteInterface } from '../interfaces/cliente.interface';

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
    cuenta?:ClienteInterface; 

    constructor() { }

    getTextCuenta():string{
        let name:string = "Cuenta";

        for (let i = 0; i < this.parametros.length; i++) {
            const parametro = this.parametros[i];
            
            //buscar el nombre en el parametro 57
            if(parametro.parametro == 57){
                name = parametro.pa_Caracter ?? "Cuenta";
                break;
            }

        }

        return name;
        
    }


}
