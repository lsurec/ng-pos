import { Injectable } from "@angular/core";
import { EmpresaInterface } from "../interfaces/empresa.interface";
import { EstacionInterface } from "../interfaces/estacion.interface";

@Injectable({
    providedIn: 'root'
})
export class SharedService {
    empresas: EmpresaInterface[] = [];
    estaciones: EstacionInterface[] = [];

}