
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DataUserService {

  //Nombre del display al que se está navegando
  nameDisplay: string = "";


  //TODO:Eliminar fel
  switchState: boolean = false;


  constructor() { }



}
