
import { Injectable } from '@angular/core';
import { EmpresaInterface } from '../interfaces/empresa.interface';
import { EstacionInterface } from '../interfaces/estacion.interface';

@Injectable({
  providedIn: 'root',
})
export class DataUserService {
  // Define tus datos o funcionalidades aquí
  token = "";
  user = "";
  empresas: EmpresaInterface[] = [];
  estaciones: EstacionInterface[] = [];
  selectedEmpresa?:EmpresaInterface;
  selectedEstacion?:EstacionInterface;


  constructor() {}


  
}
