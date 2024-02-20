import { Injectable } from '@angular/core';
import { TypesDocConvertInterface } from '../interfaces/types-doc-convert.interface';


@Injectable({
    providedIn: 'root',
})
export class GlobalConvertService{


    isLoading: boolean = false; //pantalla de carga
    showError: boolean = false;
    verTiposDocConversion: boolean = false;
    verDocOrigen: boolean = false;
    verDocDestino: boolean = false;
    verDocConversion: boolean = false;
    verDetalleDocConversion: boolean = false;
  
    docSelect?:TypesDocConvertInterface;
    docs :TypesDocConvertInterface[] = [];
    screen:string = ""; 
    //vacio regresar a TypesDocsComponent
    //si tiene algo regresar a hoe

}