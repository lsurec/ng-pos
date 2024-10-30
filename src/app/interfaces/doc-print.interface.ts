// empresa.interface.ts
export interface Empresa {
  razonSocial: string;
  nombre: string;
  direccion: string;
  nit: string;
  tel: string;
}

// documento.interface.ts
export interface DocumentoData {
  titulo: string;
  descripcion: string;
  fechaCert: string;
  serie: string;
  no: string;
  autorizacion: string;
  serieInterna: string;
  noInterno: string;
  consecutivo: number;
  evento:string,
}

// cliente.interface.ts
export interface Cliente {
  correo: string;
  nombre: string;
  direccion: string;
  nit: string;
  fecha: Date;
  tel: string;
  tipo:string;
}

export interface Fechas {
  fechaInicio: Date | undefined | null,
  fechaFin: Date | undefined | null;
  fechaInicioRef: Date | undefined | null;
  fechaFinRef: Date | undefined | null;
}

// item.interface.ts
export interface Item {
  sku: string;
  descripcion: string;
  cantidad: number;
  unitario: string;
  precioDia: string,
  total: string;
  cargos:string,
  descuentos:string;
  precioRepocision:string;
  imagen64?:string;
}

// montos.interface.ts
export interface Montos {
  subtotal: string;
  cargos: string;
  descuentos: string;
  total: string;
  totalLetras: string;
}

// pago.interface.ts
export interface Pago {
  tipoPago: string;
  pago: string;
  monto: string;
  cambio: string;
}

// certificador.interface.ts
export interface Certificador {
  nombre: string;
  nit: string;
}

// powered-by.interface.ts
export interface PoweredBy {
  nombre: string;
  website: string;
}
export interface ObservacionesRef {
  observacion2: string, //contcto
  descripcion: string, //Descripcion
  observacion3: string, //direccion entrga
  observacion: string, //observacion
};


export interface DocPrintModel {
  image64Empresa:string;
  evento?:string;
  cantidadDias?:number,
  noDoc: string;
  empresa: Empresa;
  documento: DocumentoData;
  cliente: Cliente;
  fechas?: Fechas;
  items: Item[];
  montos: Montos;
  pagos: Pago[];
  vendedor: string;
  emailVendedor: string;
  certificador: Certificador;
  observacion: string;
  mensajes: string[];
  poweredBy: PoweredBy;
  refObservacones?: ObservacionesRef;
}
