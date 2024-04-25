export interface UpdateDocInterface {
    tipoDocumento:      number;
    serie:              string;
    empresa:            number;
    localizacion:       number;
    estacion:           number;
    fechaHora:          Date;
    user:               string;
    mUser:              string;
    cuentaCorrentista:  number;
    cuentaCuenta:       string;
    documentoNombre:    string;
    documentoNit:       string;
    documentoDireccion: string;
    observacion1:       string;
    fechaDocumento:     Date;
    observacion2:       string;
    estadoDocumento:    number;
    fechaIni:           Date;
    fechaFin:           Date;
    observacion3:       string;
    consecutivoInterno: number;
}
