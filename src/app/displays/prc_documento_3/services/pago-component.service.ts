import { Injectable } from '@angular/core';
import { FormaPagoInterface } from '../interfaces/forma-pago.interface';
import { CuentaBancoInterface } from '../interfaces/cuenta-banco.interface';
import { BancoInterface } from '../interfaces/banco.interface';

@Injectable({
    providedIn: 'root',
})
export class PagoComponentService {

    //datos para la pantalla pago
    forms: boolean = false; //ver formulario montos
    pago?: FormaPagoInterface; //Pago seleccionado
    banco?: BancoInterface; //banco seleccionado
    bancos: BancoInterface[] = []; //bancos disponibles
    cuentas:CuentaBancoInterface[]=[]; //cuentas bancarias disponibles
    monto:string = "0"; //input Monto que se asigna al pago
    cuentaSelect?: CuentaBancoInterface; //cuenta bancaria seleccionada
    autorizacion: string = ""; //inpur autorizacion
    referencia: string = "" //input referencia


}