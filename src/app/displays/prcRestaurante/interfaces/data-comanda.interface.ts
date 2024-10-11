export interface DataComandaInterface {
    id_Documento:              string;
    tipo_Documento:            string;
    serie_Documento:           string;
    iD_Documento_Ref:          string;
    comensal:                  string;
    consecutivo_Interno:       number;
    fecha_Hora:                Date;
    des_Ubicacion:             string;
    des_Mesa:                  string;
    des_Serie_Documento:       string;
    userName:                  string;
    producto_Id:               string;
    unidad_Medida:             string;
    des_Producto:              string;
    bodega:                    string;
    cantidad:                  number;
    tipo_Transaccion:          number;
    printerName:               string;
    d_Consecutivo_Interno:     number;
    observacion:               string;
    tra_Consecutivo_Interno:   number;
    consecutivo_Interno_Padre: number | null;
}


export interface FormatoComandaInterface{
 bodega:string,
 ipAdress:string,
 detalles:DataComandaInterface[],   
}