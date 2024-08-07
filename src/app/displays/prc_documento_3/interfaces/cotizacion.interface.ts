export interface CotizacionInterface {
    usuario: string | null;
    razon_Social: string | null;
    empresa_Nit: string | null;
    fecha_Documento: Date | null;
    id_Documento: string | null;
    fecha_Entrega: Date | null;
    serie_Doc: string | null;
    observacion_1: string | null;
    departamento: any | null;
    observacion_3: any | null;
    cliente: string | null;
    nit_Cliente: string | null;
    direccion_Cliente: string | null;
    telefono_Cliente: any | null;
    email_Cliente: string | null;
    puesto_Cliente: any | null;
    empresa_Cliente: string | null;
    apellidos_Cliente: any | null;
    dpi: string | null;
    vendedor_Nombre: string | null;
    vendedor_Email: string | null;
    clase_Producto: number | null;
    tipo_producto: number | null;
    producto_Id: string | null;
    producto: number | null;
    unidad_Medida: number | null;
    des_Producto: string | null;
    tipo_Cambio: number | null;
    des_Unidad_Medida: string | null;
    marca: string | null;
    cuenta_Usuario: string | null;
    email_Usuario: string | null;
    telefono_Usuario: string | null;
    simbolo: string | null;
    moneda: number | null;
    imagen: any | null;
    fecha_Evento: Date | null;
    refFecha_Ini: Date | null;
    refFecha_Fin: Date | null;
    fecha_Ini: Date | null;
    fecha_Fin: Date | null;
    contacto: any | null;
    descripcion: any | null;
    informacion: any | null;
    observacion: any | null;
    fecha_Rango: number | null;
    precio_Unitario: number | null;
    precio_Dias: number | null;
    cantidad: number | null;
    sub_Monto: number | null;
    descuento: any | null;
    orden: number | null;
    precio_Reposicion: any | null;
    valor_Letras: string | null;
    total: number | null;
}
