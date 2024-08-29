export interface ProductoInterface {
    ID:          number;
    producto:          number;
    unidad_Medida:     number;
    producto_Id:       string;
    des_Producto:      string;
    des_Unidad_Medida: string;
    tipo_Producto:     number;
    orden:     any;
    rows:     number;
}


export interface ImagenProductoInterface {
    producto: ProductoInterface,
    imagenesUrl: string[],
}
