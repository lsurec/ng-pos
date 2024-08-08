
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DataUserService {


  version:string = "1.0.4";

  //Nombre del display al que se está navegando
  nameDisplay: string = "";

  urlImage="";

  
  simboloMoneda: string = " ";
  decimalPlaces: number = 2;
  integerDigits: number = 2;

  //TODO:Eliminar fel
  switchState: boolean = false;


  constructor() { }



}
