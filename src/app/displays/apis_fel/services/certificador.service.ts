import { Injectable } from "@angular/core";
import { ApiInterface } from "../interfaces/api.interface";

@Injectable({
    providedIn: 'root',
})

export class CertificadorService {

    isLoading: boolean = false;
    catalogo: boolean = false;
    certificador: boolean = true;
    apiDetalle: boolean = false;
    api?: ApiInterface;
}