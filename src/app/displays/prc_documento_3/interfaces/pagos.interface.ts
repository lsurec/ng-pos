
export interface PagoInterface {
    id: number;
    nombre: string;
    monto?: number;
    referencia?: string;
    autorizacion?: string;
    banco?: string;
    checked?: boolean;
}