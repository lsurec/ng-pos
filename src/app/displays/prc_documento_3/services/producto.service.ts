import { Injectable } from '@angular/core';
import { UnitarioInterface } from '../interfaces/unitario.interface';
import { BodegaProductoInterface } from '../interfaces/bodega-produto.interface';

@Injectable({
    providedIn: 'root',
})
export class ProductoService{
  
    //Datos para el dialogo de productos
    total:number = 0; //total de la transaccion (cantidad * precio)
    precios: UnitarioInterface[] = []; //Tipos de precios disponobles
    precio?:UnitarioInterface; //precio seleccionado 
    bodegas:BodegaProductoInterface[]=[]; //Bodegas disponobles para el producto
    bodega?:BodegaProductoInterface; //Bodega seleccionada
    cantidad:string = "1"; //Cantidad del producto
    precioU:number = 0; //Precio unitario
    precioText:string = "0"; //precio unitario modificable



}