export interface DocHistoricoInterface {
    user:                   string;
    consecutivo_Interno:    number;
    documento_Nombre:       string;
    documento_NIT:          string;
    documento_Direccion:    string;
    documento_Direccion2:   string;
    id_Documento:           string;
    fecha_Documento:        Date;
    fecha_Hora:             Date;
    userName:               string;
    bloqueado:              boolean;
    impresion_Doc:          number;
    des_Tipo_Documento:     string;
    des_Serie_Documento:    string;
    des_Estado_Documento:   string;
    ref_Id_Documento:       any;
    ref_Serie:              any;
    bodega_Origen:          any;
    bodega_Destino:         any;
    id_Doc_Alt:             any;
    t_Tra_M:                number;
    fE_CAE:                 string;
    gpS_Latitud:            any;
    gpS_Longitud:           any;
    fE_Numero:              string;
    fE_numeroDocumento:     string;
    fE_Fecha_Certificacion: string;
    feL_UUID_Anulacion:     string;
}
