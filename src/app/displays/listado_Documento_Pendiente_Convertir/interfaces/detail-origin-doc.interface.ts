export interface DetailOriginDocInterface {

    relacion_Consecutivo_Interno:    number;
    disponible:                      number;
    clase:                           string;
    marca:                           string | null;
    id:                              string;
    producto_Descripcion:            string;
    bodega_Descripcion:              string;
    cantidad:                        number;
    producto:                        number;
    unidad_Medida:                   number;
    fDes_Unidad_Medida:              string;
    tipo_Precio:                     number;
    bodega:                          number;
    monto:                           number;
    transaccion_Consecutivo_Interno: number;
}



export interface DetailOriginDocInterInterface {

    disponibleMod: number;
    checked: boolean;
    detalle: DetailOriginDocInterface;
}
