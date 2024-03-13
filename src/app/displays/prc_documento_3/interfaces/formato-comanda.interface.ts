import { PrintDataComandaInterface } from "./print-data-comanda.interface";

export interface FormatoComandaInterface{
    bodega:string;
    ipAdress:string;
    detalles:PrintDataComandaInterface[];
}