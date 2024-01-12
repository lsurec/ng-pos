import { BancoInterface } from "./banco.interface";
import { CuentaBancoInterface } from "./cuenta-banco.interface";
import { FormaPagoInterface } from "./forma-pago.interface";

export interface MontoIntreface {
    checked: boolean;
    payment: FormaPagoInterface;
    amount: number;
    difference: number;
    authorization: string;
    reference: string;
    account?: CuentaBancoInterface;
    bank?: BancoInterface;
  }