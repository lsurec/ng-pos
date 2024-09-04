export interface UpdateDocInterface {
    consecutivoInterno: number,
    cuentaCorrentista: number,
    cuentaCorrentistaRef: number | null | undefined,
    cuentaCuenta: string,
    documentoDireccion: string,
    documentoNit: string,
    documentoNombre: string,
    empresa: number,
    estacionTrabajo: number,
    fechaDocumento: Date,
    fechaFin: Date | null | undefined,
    fechaHora: Date,
    fechaIni: Date | null | undefined,
    idDocumento: string,
    localizacion: number,
    mUser: string,
    observacion: string,
    referencia: number | null | undefined,
    serieDocumento: string,
    tipoDocumento: number,
    user: string,
}
