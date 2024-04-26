export interface UpdateDocInterface {
    tipoDocumento: number;
    serieDocumento: string;
    empresa: number;
    localizacion: number;
    estacionTrabajo: number;
    fechaHora: Date;
    user: string;
    mUser: string;
    cuentaCorrentista: number;
    cuentaCuenta: string;
    documentoNombre: string;
    documentoNit: string;
    documentoDireccion: string;
    observacion: string;
    fechaDocumento: Date;
    cuentaCorrentistaRef: number | null | undefined;
    consecutivoInterno: number;
    fechaIni: Date | null | undefined;
    fechaFin: Date | null | undefined;
    idDocumento: string;
    referencia:number | null | undefined, 
}
