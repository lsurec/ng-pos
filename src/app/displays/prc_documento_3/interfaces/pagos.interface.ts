// export interface MetodoPagoInterface {
//     id: number;
//     nombre: string;
// }

export interface BancosInterface {
    id: number;
    nombre: string;
}

export interface PagoInterface {
    id: number;
    nombre: string;
    monto?: number;
    referencia?: string;
    autorizacion?: string;
    banco?: string;
    checked?: boolean;
}

export interface CuentaBancoInterface {
    numero: number;
    nombre: string;
}
