export interface ProductoInterface {
    producto:          number;
    unidad_Medida:     number;
    producto_Id:       string;
    des_Producto:      string;
    des_Unidad_Medida: string;
    tipo_Producto:     number;
}

//TODO:Eliminar
export interface CompraInterface {
    producto: ProductoInterface
    cantidad: number,
    precioUnitario: number;
    total: number;
    cargos?: number;
    descuentos?: number;
    checked?: boolean;
}

