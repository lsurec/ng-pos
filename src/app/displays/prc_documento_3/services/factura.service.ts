
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class FacturaService {
    isLoading: boolean = false;
    tipoDocumento?: number;
    documentoName: string = "";

    constructor() { }



}
