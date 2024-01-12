
import { Injectable } from '@angular/core';
import { SerieInterface } from '../interfaces/serie.interface';
import { VendedorInterface } from '../interfaces/vendedor.interface';
import { TipoTransaccionInterface } from '../interfaces/tipo-transaccion.interface';
import { ParametroInterface } from '../interfaces/parametro.interface';
import { FormaPagoInterface } from '../interfaces/forma-pago.interface';
import { ClienteInterface } from '../interfaces/cliente.interface';
import { TraInternaInterface } from '../interfaces/tra-interna.interface';

@Injectable({
    providedIn: 'root',
})
export class FacturaService {
    isLoading: boolean = false;
    tipoDocumento?: number;
    documentoName: string = "";
    series: SerieInterface[] = []
    serie?: SerieInterface;
    vendedores: VendedorInterface[] = [];
    vendedor?: VendedorInterface;
    tiposTransaccion: TipoTransaccionInterface[] = [];
    parametros: ParametroInterface[] = [];
    formasPago: FormaPagoInterface[] = [];
    cuenta?: ClienteInterface;

    // TODO:Montos, agregar interface 
    amounts: any[] = [];
    traInternas:TraInternaInterface[] = [];

    //Seleccionar todas las transacciones
    selectAllTra:boolean = false;



    constructor() { }

    addTransaction(transaccion:TraInternaInterface){
        transaccion.isChecked = this.selectAllTra;
        this.traInternas.push(transaccion);
        //TODO:Calcular totales
    }

    getTextCuenta(): string {
        let name: string = "Cuenta";

        for (let i = 0; i < this.parametros.length; i++) {
            const parametro = this.parametros[i];

            //buscar el nombre en el parametro 57
            if (parametro.parametro == 57) {
                name = parametro.pa_Caracter ?? "Cuenta";
                break;
            }

        }

        return name;

    }

    editPrice(): boolean {
        let edit: boolean = false;

        for (let i = 0; i < this.parametros.length; i++) {
            const param = this.parametros[i];

            //buscar parametro para editar el precio (351)
            if (param.parametro == 351) {
                edit = true;
                break;
            }
        }

        return edit;
    }


}
