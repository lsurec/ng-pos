import { Injectable } from '@angular/core';
import { TypesDocConvertInterface } from '../interfaces/types-doc-convert.interface';


@Injectable({
    providedIn: 'root',
})
export class GlobalConvertService{
  
    docSelect?:TypesDocConvertInterface;
    docs :TypesDocConvertInterface[] = [];
    screen:string = ""; 
    //vacio regresar a TypesDocsComponent
    //si tiene algo regresar a hoe

}