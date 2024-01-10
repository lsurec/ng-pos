
import { Injectable } from '@angular/core';
import { SerieInterface } from '../interfaces/serie.interface';
import { VendedorInterface } from '../interfaces/vendedor.interface';

@Injectable({
    providedIn: 'root',
})
export class FacturaService {
    isLoading: boolean = false;
    tipoDocumento?: number;
    documentoName: string = "";
    series:SerieInterface[] = []
    serieSelect?:SerieInterface;
    vendedores:VendedorInterface[] = [];
    vendedorSelect?:VendedorInterface;

    constructor() { }



}
