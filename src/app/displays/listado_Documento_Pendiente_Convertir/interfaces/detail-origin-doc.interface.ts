export interface DetailOriginDocInterface {
    consecutivo_Interno: number;
    disponible:          number;
    clase:               string;
    marca:               null | string;
    id:                  string;
    produc:              string;
    bodega:              string;
    cantidad:            number;
    producto:            string;
    unidad_Medida:       number;
    fDes_Unidad_Medida:  string;
    tipo_Precio:         number;
}


export interface DetailOriginDocInterInterface {

    disponibleMod: number;
    checked: boolean;
    detalle: DetailOriginDocInterface;
}
