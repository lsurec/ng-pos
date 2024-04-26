export interface UpdateRefInterface {
    descripcion:    string | null| undefined;
    referenciaID:   string | null;
    empresa:        number;
    referencia:     number | null;
    observacion:    string | null| undefined;
    fechaIni:       Date | null;
    fechaFin:       Date | null;
    tipoReferencia: number | null;
    mUser:          string;
    observacion2:   string | null| undefined;
    observacion3:   string | null| undefined;
}
