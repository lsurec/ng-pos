// documento.interface.ts

export interface Documento {
  Doc_Tra_Monto: number;
  Doc_CA_Monto: number;
  Doc_ID_Certificador: number;
  Doc_Cuenta_Correntista_Ref: number | null;
  Doc_ID_Documento_Ref: number;
  Doc_FEL_numeroDocumento: string | null;
  Doc_FEL_Serie: string | null;
  Doc_FEL_UUID: string | null;
  Doc_FEL_fechaCertificacion: string | null;
  Doc_Fecha_Documento: string;
  Doc_Cuenta_Correntista: number;
  Doc_Cuenta_Cta: string;
  Doc_Tipo_Documento: number;
  Doc_Serie_Documento: string;
  Doc_Empresa: number;
  Doc_Estacion_Trabajo: number;
  Doc_UserName: string;
  Doc_Observacion_1: string;
  Doc_Tipo_Pago: number;
  Doc_Elemento_Asignado: number;
  Doc_Transaccion: Transaccion[];
  Doc_Cargo_Abono: CargoAbono[];
}

export interface Transaccion {
  Tra_Consecutivo_Interno: number;
  Tra_Consecutivo_Interno_Padre: number | null;
  Tra_Bodega: number;
  Tra_Producto: number;
  Tra_Unidad_Medida: number;
  Tra_Cantidad: number;
  Tra_Tipo_Cambio: number;
  Tra_Moneda: number;
  Tra_Tipo_Precio: number | null;
  Tra_Factor_Conversion: number | null;
  Tra_Tipo_Transaccion: number;
  Tra_Monto: number;
}

export interface CargoAbono {
  Tipo_Cargo_Abono: number;
  Monto: number;
  Cambio: number;
  Tipo_Cambio: number;
  Moneda: number;
  Monto_Moneda: number;
  Referencia: string | null;
  Autorizacion: string | null;
  Banco: number | null;
  Cuenta_Bancaria: number | null;
}
