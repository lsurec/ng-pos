
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DataUserService {

  //Nombre del display al que se está navegando
  nameDisplay: string = "";

  simboloMoneda: string = " ";
  decimalPlaces: number = 2;
  integerDigits: number = 2;

  //TODO:Eliminar fel
  switchState: boolean = false;


  constructor() { }



}
