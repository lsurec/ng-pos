import { TipoDatoInterface } from "./tipo_dato.interface";
import { TipoParametroInterface } from "./tipo_parammetro.interface";

export interface Parametro {
    parametro: TipoParametroInterface | null;
    valorN: string;
    dato: TipoDatoInterface | null;
    descripcionN: string;
}