export interface ProductoInterface {
    sku: string,
    nombre: string,
    checked?: boolean;
}

export interface CompraInterface {
    producto: ProductoInterface
    cantidad: number,
    precioUnitario: number;
    total: number;
    cargos?: number;
    descuentos?: number;
    checked?: boolean;
}

