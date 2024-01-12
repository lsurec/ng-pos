// doc-estructura.model.ts
export interface DocEstructuraInterface {
    docTraMonto: number;
    docCaMonto: number;
    docCuentaVendedor?: number;
    docIdCertificador: number;
    docIdDocumentoRef: number;
    docFelNumeroDocumento?: number;
    docFelSerie?: string;
    docFelUUID?: string;
    docFelFechaCertificacion?: Date;
    docFechaDocumento: string;
    docCuentaCorrentista: number;
    docCuentaCta: string;
    docTipoDocumento: number;
    docSerieDocumento: string;
    docEmpresa: number;
    docEstacionTrabajo: number;
    docUserName: string;
    docObservacion1: string;
    docTipoPago: number;
    docElementoAsignado: number;
    docTransaccion: DocTransaccion[];
    docCargoAbono: DocCargoAbono[];
  }
  
  export interface DocCargoAbono {
    tipoCargoAbono: number;
    monto: number;
    cambio: number;
    tipoCambio: number;
    moneda: number;
    montoMoneda?: number;
    referencia?: any;
    autorizacion?: any;
    banco?: any;
    cuentaBancaria?: any;
  }
  
  export interface DocTransaccion {
    traConsecutivoInterno: number;
    traConsecutivoInternoPadre?: number;
    traBodega: number;
    traProducto: number;
    traUnidadMedida: number;
    traCantidad: number;
    traTipoCambio: number;
    traMoneda: number;
    traTipoPrecio?: number;
    traFactorConversion?: number;
    traTipoTransaccion: number;
    traMonto: number;
  }
  