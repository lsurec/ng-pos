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
    correo:string;
    nombre: string;
    direccion: string;
    nit: string;
    fecha: Date;
    tel: string;
  }

  export interface Fechas{
    fechaInicio:Date,
    fechaFin:Date;
    fechaInicioRef:Date;
    fechaFinRef:Date;
  }
  
  // item.interface.ts
  export interface Item {
    sku:string;
    descripcion: string;
    cantidad: number;
    unitario: string;
    precioDia:string,
    total: string;
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
  export interface ObservacionesRef{
    observacion2:string, //contcto
    descripcion:string, //Descripcion
    observacion3:string, //direccion entrga
    observacion:string, //observacion
  };
  
  
  export interface DocPrintModel {
    noDoc:string;
    empresa: Empresa;
    documento: DocumentoData;
    cliente: Cliente;
    fechas?:Fechas;
    items: Item[];
    montos: Montos;
    pagos: Pago[];
    vendedor: string;
    certificador: Certificador;
    observacion: string;
    mensajes: string[];
    poweredBy: PoweredBy;
    refObservacones?:ObservacionesRef;
  }
  