import { Injectable } from '@angular/core';
import { UnitarioInterface } from '../interfaces/unitario.interface';
import { BodegaProductoInterface } from '../interfaces/bodega-produto.interface';
import { FormaPagoInterface } from '../interfaces/forma-pago.interface';
import { CuentaBancoInterface } from '../interfaces/cuenta-banco.interface';
import { BancoInterface } from '../interfaces/banco.interface';

@Injectable({
    providedIn: 'root',
})
export class PagoComponentService {

    forms: boolean = false;
    pago?: FormaPagoInterface;
    banco?: BancoInterface;
    bancos: BancoInterface[] = [];
    cuentas:CuentaBancoInterface[]=[];
    monto:string = "0";
    cuentaSelect?: CuentaBancoInterface;


}