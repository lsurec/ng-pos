
import { Injectable } from '@angular/core';
import { SerieInterface } from '../interfaces/serie.interface';
import { VendedorInterface } from '../interfaces/vendedor.interface';
import { TipoTransaccionInterface } from '../interfaces/tipo-transaccion.interface';
import { ParametroInterface } from '../interfaces/parametro.interface';
import { FormaPagoInterface } from '../interfaces/forma-pago.interface';
import { ClienteInterface } from '../interfaces/cliente.interface';
import { TraInternaInterface } from '../interfaces/tra-interna.interface';
import { MontoIntreface } from '../interfaces/monto.interface';
import { PagoComponentService } from './pogo-component.service';

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

    montos: MontoIntreface[] = [];
    traInternas: TraInternaInterface[] = [];

    //Seleccionar todas las transacciones
    selectAllTra: boolean = false;


    //totales del documento
    //Reiniciar valores
    subtotal: number = 0;
    cargo: number = 0;
    descuento: number = 0;
    total: number = 0;


    //Toales pago
    saldo: number = 0;
    cambio: number = 0;
    pagado: number = 0;


    constructor(
        private _pagoComponentService: PagoComponentService
    ) { }


    addMonto(monto: MontoIntreface) {
        this.montos.push(monto);
        this.calculateTotalesPago();
    }

    calculateTotalesPago() {
        //TODO: Guardar documento local (storage)
        this.saldo = 0;
        this.cambio = 0;
        this.pagado = 0;

        this.montos.forEach(element => {
            this.pagado += element.amount;
        });

        this.montos.forEach(element => {
            this.pagado += element.difference;
        });

        //calcular y cambio y saldo pendiente de pagar
        if (this.pagado > this.total) {
            this.cambio = this.pagado - this.total;
        } else {
            this.saldo = this.total - this.pagado;
        }

        this._pagoComponentService.monto = parseFloat(this.saldo.toFixed(2)).toString();

    }

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

        this.calculateTotalesPago();

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

    //Proceso fel
    printFel():boolean {

        let fel: boolean = false;

        for (let i = 0; i < this.parametros.length; i++) {
            const element = this.parametros[i];
            //el parametro que indica si genera fel o no es 349

            if (element.parametro == 349) {
                fel = true;
                break;
            }
        }


        return fel;
    }


}
