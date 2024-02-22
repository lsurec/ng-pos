export interface DetailsOriginDocInterface {
    consecutivo_Interno: number;
    disponible: number;
    clase: string;
    marca: any;
    id: string;
    producto: string;
    bodega: string;
    cantidad: number;
}


export interface DetailsOriginDocInterInterface {

    disponibleMod: number;
    checked: boolean;
    detalle: DetailsOriginDocInterface;
}
