import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root',
})

export class CertificadorService {

    isLoading: boolean = false;
    catalogo: boolean = false;
    certificador: boolean = true;
}