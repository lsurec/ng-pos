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
    noInterno: string;
  }
  
  // cliente.interface.ts
  export interface Cliente {
    nombre: string;
    direccion: string;
    nit: string;
    fecha: Date;
    tel: string;
  }
  
  // item.interface.ts
  export interface Item {
    descripcion: string;
    cantidad: number;
    unitario: string;
    total: string;
  }
  
  // montos.interface.ts
  export interface Montos {
    subtotal: number;
    cargos: number;
    descuentos: number;
    total: number;
    totalLetras: string;
  }
  
  // pago.interface.ts
  export interface Pago {
    tipoPago: string;
    pago: number;
    monto: number;
    cambio: number;
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
  
  
  export interface DocPrintModel {
    empresa: Empresa;
    documento: DocumentoData;
    cliente: Cliente;
    items: Item[];
    montos: Montos;
    pagos: Pago[];
    vendedor: string;
    certificador: Certificador;
    observacion: string;
    mensajes: string[];
    poweredBy: PoweredBy;
  }
  