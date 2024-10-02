export interface GarnishInterface {
    producto_Caracteristica:       number;
    producto_Caracteristica_Padre: number | null;
    nivel:                         number;
    raiz:                          number;
    descripcion:                   string;
    producto:                      number;
    unidad_Medida:                 number;
    f_Producto:                    number | null;
    f_Unidad_Medida:               number | null;
    f_Bodega:                      number | null;
    cantidad:                      number | null;
    des_Producto:                  string;
    des_Unidad_Medida:             string;
    f_Des_Producto:                null | string;
    f_Des_Unidad_Medida:           null | string;
    nom_Bodega:                    null | string;
}

export interface GarnishTreeInterface {
    idFather?: number | null | undefined;
    idChild?: number | null | undefined;
    children: GarnishTreeInterface[];
    route: GarnishTreeInterface[];
    item?: GarnishInterface | null | undefined;
    selected?: GarnishInterface | null | undefined;
  }
  