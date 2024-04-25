export interface OriginDocInterface {
    documento:                        number;
    tipo_Documento:                   number;
    serie_Documento:                  string;
    empresa:                          number;
    localizacion:                     number;
    estacion_Trabajo:                 number;
    fecha_Reg:                        number;
    fecha_Documento:                  Date;
    fecha_Hora:                       Date;
    usuario:                          string;
    documento_Descripcion:            string;
    serie:                            string;
    cuenta_Correntista:               number;
    cuenta_Cta:                       string;
    cuenta_Correntista_Ref:           number;
    nit:                              string;
    cliente:                          string;
    direccion:                        string;
    iD_Documento:                     number;
    observacion_1:                    string;
    fecha_Ini:                        Date | null;
    fecha_Fin:                        Date | null;
    monto:                            number;
    referencia:                       number | null;
    consecutivo_Interno:              number;
    referencia_D_Fecha_Ini:           Date | null;
    referencia_D_Fecha_Fin:           Date | null;
    referencia_D_Descripcion:         null | string;
    referencia_D_Observacion:         null | string;
    referencia_D_Observacion_2:       null | string;
    referencia_D_Observacion_3:       null | string;
    tipo_Referencia:                  number;
    referencia_D_Des_Tipo_Referencia: string | null;
}


