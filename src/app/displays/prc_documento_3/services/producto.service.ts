import { Injectable } from '@angular/core';
import { UnitarioInterface } from '../interfaces/unitario.interface';
import { BodegaProductoInterface } from '../interfaces/bodega-produto.interface';

@Injectable({
    providedIn: 'root',
})
export class ProductoService{
  
    total:number = 0;
    precios: UnitarioInterface[] = [];
    precio?:UnitarioInterface;
    bodegas:BodegaProductoInterface[]=[];
    bodega?:BodegaProductoInterface;
    cantidad:string = "1";
    precioU:number = 0;
    precioText:string = "0";



}