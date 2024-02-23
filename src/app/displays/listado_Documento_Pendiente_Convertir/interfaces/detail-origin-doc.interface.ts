export interface DetailOriginDocInterface {
    consecutivo_Interno: number;
    disponible: number;
    clase: string;
    marca: any;
    id: string;
    producto: string;
    bodega: string;
    cantidad: number;
}


export interface DetailOriginDocInterInterface {

    disponibleMod: number;
    checked: boolean;
    detalle: DetailOriginDocInterface;
}
