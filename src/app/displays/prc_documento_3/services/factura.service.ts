
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
    traInternas: TraInternaInterface[] = [];

    //Seleccionar todas las transacciones
    selectAllTra: boolean = false;


    //totales del documento
    //Reiniciar valores
    subtotal: number = 0;
    cargo: number = 0;
    descuento: number = 0;
    total: number = 0;



    constructor() { }

    calculateTotales() {
        //TODO: Guardar documento local (storage)
        this.subtotal = 0;
        this.cargo = 0;
        this.descuento = 0;
        this.total = 0;

        this.traInternas.forEach(element => {
            element.cargo = 0;
            element.descuento = 0;

            element.operaciones.forEach(tra => {
                element.cargo += tra.cargo;
                element.descuento += tra.descuento;

            });
        });


        this.traInternas.forEach(element => {
            this.subtotal += element.total;
            this.cargo += element.cargo;
            this.descuento += element.descuento;
        });


        this.total = this.cargo + this.descuento + this.subtotal;

        //TODO:Calcular totales en forma de pago

    }

    addTransaction(transaccion: TraInternaInterface) {
        transaccion.isChecked = this.selectAllTra;
        this.traInternas.push(transaccion);
        this.calculateTotales();
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
